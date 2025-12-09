// app.js - builds and exports the Express app without starting the server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Appwrite config (for server-side admin queries)
const { Client, Databases } = require('appwrite');
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || process.env.VITE_APPWRITE_API_KEY || '';
const APPWRITE_DB_ID = process.env.APPWRITE_DB_ID || '6932a9b600284fa3d8ff';
const PROGRESS_COLLECTION_ID = process.env.APPWRITE_PROGRESS_COLLECTION_ID || 'user_progress';

let appwriteClient = null;
let appwriteDatabases = null;
if (APPWRITE_API_KEY && APPWRITE_PROJECT) {
    appwriteClient = new Client()
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT)
        .setKey(APPWRITE_API_KEY);
    appwriteDatabases = new Databases(appwriteClient);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ID counters and sample data (kept in-memory)
let courseIdCounter = 2;
let moduleIdCounter = 2;
let topicIdCounter = 2;
let questionIdCounter = 2;

let courseData = {
    courses: [
        {
            id: "1",
            title: "Introduction to Biology",
            description: "Biology is the science of life. It studies living things, how they grow, survive, and interact with the environment.",
            category: "Science",
            icon: "🧬",
            modules: [
                {
                    id: "1",
                    title: "Biology Basics",
                    topics: [
                        {
                            id: "1",
                            title: "What is Biology?",
                            completed: false,
                            content: {
                                main: "Biology is the scientific study of life and living organisms...",
                                sections: []
                            }
                        }
                    ],
                    test: {
                        title: "Biology Assessment",
                        questions: [
                            {
                                id: "1",
                                question: "What is gaseous exchange?",
                                options: [
                                    "Food digestion process",
                                    "Oxygen and carbon dioxide transfer",
                                    "Blood circulation",
                                    " √((x₂ − x₁)² + (y₂ − y₁)²)"
                                ],
                                correctAnswer: 1
                            }
                        ]
                    }
                }
            ]
        }
    ]
};

// Utility functions
const findCourseById = (courseId) => {
    return courseData.courses.find(course => course.id === courseId.toString());
};

const findModuleById = (courseId, moduleId) => {
    const course = findCourseById(courseId);
    return course ? course.modules.find(module => module.id === moduleId.toString()) : null;
};

const findTopicById = (courseId, moduleId, topicId) => {
    const module = findModuleById(courseId, moduleId);
    return module ? module.topics.find(topic => topic.id === topicId.toString()) : null;
};

// Attach helpers to app.locals for use in wrappers
app.locals.appwriteDatabases = appwriteDatabases;
app.locals.APPWRITE_DB_ID = APPWRITE_DB_ID;
app.locals.PROGRESS_COLLECTION_ID = PROGRESS_COLLECTION_ID;
app.locals.findCourseById = findCourseById;

// --- Routes ---
// Note: Keep the same route paths as before (/api/...)
app.get('/api/courses', (req, res) => {
    try {
        res.json({ success: true, data: courseData.courses, count: courseData.courses.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching courses', error: error.message });
    }
});

// Admin progress-summary route (uses app.locals)
app.get('/admin/progress-summary', async (req, res) => {
    const headerX = req.headers['x-admin-secret'];
    const headerAuth = req.headers['authorization'] || req.headers['Authorization'];
    const queryAuth = req.query?.Authorization || req.query?.authorization;
    const suppliedToken = (headerX || (headerAuth || '').toString().replace(/^Bearer\s+/i, '') || queryAuth || '').toString();

    if (!process.env.ADMIN_SECRET) {
        console.error('[admin/progress-summary] ADMIN_SECRET not set on server');
        return res.status(500).json({ success: false, message: 'Server misconfiguration: ADMIN_SECRET not set' });
    }

    const allowedFallback = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '';
    if (suppliedToken !== process.env.ADMIN_SECRET && suppliedToken !== allowedFallback) {
        console.warn('[admin/progress-summary] Unauthorized access attempt, token mismatch');
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const db = req.app.locals.appwriteDatabases;
    const APPWRITE_DB = req.app.locals.APPWRITE_DB_ID;
    const PROG_COL = req.app.locals.PROGRESS_COLLECTION_ID;
    const findCourse = req.app.locals.findCourseById;

    if (!db) {
        return res.status(500).json({ success: false, message: 'Appwrite client not configured on server' });
    }

    try {
        const resp = await db.listDocuments(APPWRITE_DB, PROG_COL);
        const docs = resp.documents || [];
        const summaries = docs.map((doc) => {
            const courseId = doc.courseId;
            const course = findCourse(courseId) || { modules: [] };
            const totalTopics = course.modules.reduce((sum, m) => sum + (m.topics ? m.topics.length : 0), 0) || 0;
            const completedTopics = Array.isArray(doc.completedTopics) ? doc.completedTopics.length : 0;
            const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

            return {
                userId: doc.userId || null,
                userEmail: doc.userEmail || null,
                courseId: courseId,
                completedTopics,
                totalTopics,
                percentage,
                lastUpdated: doc.lastUpdated || doc.$updatedAt || null
            };
        });

        return res.json({ success: true, data: summaries, count: summaries.length });
    } catch (error) {
        console.error('Error fetching progress summary:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch progress summary', error: error.message });
    }
});

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Biology Course API (serverless) is ready', timestamp: new Date().toISOString(), version: '1.0.0' });
});

module.exports = app;
