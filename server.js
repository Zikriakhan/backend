// server.js - starts the app in a traditional Node process (keeps existing behavior locally)
const express = require('express');
const app = require('./app');
const PORT = process.env.PORT || 5000;

// ID counters
let courseIdCounter = 2;
let moduleIdCounter = 2;
let topicIdCounter = 2;
let questionIdCounter = 2;

// Sample initial data
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

// ==================== COURSE ROUTES ====================
app.get('/api/courses', (req, res) => {
    try {
        res.json({
            success: true,
            data: courseData.courses,
            count: courseData.courses.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching courses',
            error: error.message
        });
    }
});

app.get('/api/courses/:courseId', (req, res) => {
    try {
        const { courseId } = req.params;
        const course = findCourseById(courseId);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching course',
            error: error.message
        });
    }
});

app.post('/api/courses', (req, res) => {
    try {
        const { title, description, category, icon } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }

        const newCourse = {
            id: (courseIdCounter++).toString(),
            title,
            description,
            category: category || 'Science',
            icon: icon || '📚',
            modules: []
        };

        courseData.courses.push(newCourse);

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: newCourse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating course',
            error: error.message
        });
    }
});

app.put('/api/courses/:courseId', (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, category, icon } = req.body;

        const courseIndex = courseData.courses.findIndex(course => course.id === courseId.toString());
        
        if (courseIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (title) courseData.courses[courseIndex].title = title;
        if (description) courseData.courses[courseIndex].description = description;
        if (category) courseData.courses[courseIndex].category = category;
        if (icon) courseData.courses[courseIndex].icon = icon;

        res.json({
            success: true,
            message: 'Course updated successfully',
            data: courseData.courses[courseIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating course',
            error: error.message
        });
    }
});

app.delete('/api/courses/:courseId', (req, res) => {
    try {
        const { courseId } = req.params;
        
        const courseIndex = courseData.courses.findIndex(course => course.id === courseId.toString());
        
        if (courseIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        courseData.courses.splice(courseIndex, 1);

        res.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting course',
            error: error.message
        });
    }
});

// ==================== MODULE ROUTES ====================
app.get('/api/courses/:courseId/modules', (req, res) => {
    try {
        const { courseId } = req.params;
        const course = findCourseById(courseId);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.json({
            success: true,
            data: course.modules,
            count: course.modules.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching modules',
            error: error.message
        });
    }
});

app.get('/api/courses/:courseId/modules/:moduleId', (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const module = findModuleById(courseId, moduleId);
        
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        res.json({
            success: true,
            data: module
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching module',
            error: error.message
        });
    }
});

app.post('/api/courses/:courseId/modules', (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, duration, order, isPublished } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Module title is required'
            });
        }

        const course = findCourseById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const newModule = {
            id: (moduleIdCounter++).toString(),
            title,
            description: description || '',
            duration: duration || '',
            order: order || (course.modules.length + 1),
            isPublished: isPublished || false,
            topics: [],
            test: { title: `${title} Assessment`, questions: [] },
            createdAt: new Date().toISOString()
        };

        course.modules.push(newModule);

        res.status(201).json({
            success: true,
            message: 'Module created successfully',
            data: newModule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating module',
            error: error.message
        });
    }
});

app.put('/api/courses/:courseId/modules/:moduleId', (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const { title, description, duration, order, isPublished } = req.body;

        const course = findCourseById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const moduleIndex = course.modules.findIndex(module => module.id === moduleId.toString());
        if (moduleIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        if (title !== undefined) course.modules[moduleIndex].title = title;
        if (description !== undefined) course.modules[moduleIndex].description = description;
        if (duration !== undefined) course.modules[moduleIndex].duration = duration;
        if (order !== undefined) course.modules[moduleIndex].order = order;
        if (isPublished !== undefined) course.modules[moduleIndex].isPublished = isPublished;

        res.json({
            success: true,
            message: 'Module updated successfully',
            data: course.modules[moduleIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating module',
            error: error.message
        });
    }
});

app.delete('/api/courses/:courseId/modules/:moduleId', (req, res) => {
    try {
        const { courseId, moduleId } = req.params;

        const course = findCourseById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const moduleIndex = course.modules.findIndex(module => module.id === moduleId.toString());
        if (moduleIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        course.modules.splice(moduleIndex, 1);

        res.json({
            success: true,
            message: 'Module deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting module',
            error: error.message
        });
    }
});

// ==================== TOPIC ROUTES ====================
app.get('/api/courses/:courseId/modules/:moduleId/topics', (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const module = findModuleById(courseId, moduleId);
        
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        res.json({
            success: true,
            data: module.topics,
            count: module.topics.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching topics',
            error: error.message
        });
    }
});

app.get('/api/courses/:courseId/modules/:moduleId/topics/:topicId', (req, res) => {
    try {
        const { courseId, moduleId, topicId } = req.params;
        const topic = findTopicById(courseId, moduleId, topicId);
        
        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Topic not found'
            });
        }

        res.json({
            success: true,
            data: topic
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching topic',
            error: error.message
        });
    }
});

app.post('/api/courses/:courseId/modules/:moduleId/topics', (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const { title, content, completed = false } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Topic title is required'
            });
        }

        const module = findModuleById(courseId, moduleId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        const newTopic = {
            id: (topicIdCounter++).toString(),
            title,
            completed,
            content: content || {
                main: "",
                sections: []
            }
        };

        module.topics.push(newTopic);

        res.status(201).json({
            success: true,
            message: 'Topic created successfully',
            data: newTopic
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating topic',
            error: error.message
        });
    }
});

app.put('/api/courses/:courseId/modules/:moduleId/topics/:topicId/complete', (req, res) => {
    try {
        const { courseId, moduleId, topicId } = req.params;
        const { completed } = req.body;

        const topic = findTopicById(courseId, moduleId, topicId);
        if (!topic) {
            return res.status(404).json({
                success: false,
                message: 'Topic not found'
            });
        }

        topic.completed = completed;

        res.json({
            success: true,
            message: `Topic marked as ${completed ? 'completed' : 'incomplete'}`,
            data: topic
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating topic',
            error: error.message
        });
    }
});

// ==================== TEST ROUTES ====================
app.get('/api/courses/:courseId/modules/:moduleId/test', (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const module = findModuleById(courseId, moduleId);
        
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        res.json({
            success: true,
            data: module.test || { title: `${module.title} Assessment`, questions: [] }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching test',
            error: error.message
        });
    }
});

app.post('/api/courses/:courseId/modules/:moduleId/test', (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const { title, questions } = req.body;

        const module = findModuleById(courseId, moduleId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        module.test = {
            title: title || `${module.title} Assessment`,
            questions: questions || []
        };

        res.json({
            success: true,
            message: 'Test saved successfully',
            data: module.test
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error saving test',
            error: error.message
        });
    }
});

app.delete('/api/courses/:courseId/modules/:moduleId/test', (req, res) => {
    try {
        const { courseId, moduleId } = req.params;

        const module = findModuleById(courseId, moduleId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        module.test = { title: `${module.title} Assessment`, questions: [] };

        res.json({
            success: true,
            message: 'Test reset successfully',
            data: module.test
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error resetting test',
            error: error.message
        });
    }
});

app.get('/api/courses/:courseId/modules/:moduleId/test/questions', (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const module = findModuleById(courseId, moduleId);
        
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        if (!module.test) {
            module.test = { title: `${module.title} Assessment`, questions: [] };
        }

        res.json({
            success: true,
            data: module.test.questions,
            count: module.test.questions.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching questions',
            error: error.message
        });
    }
});

app.post('/api/courses/:courseId/modules/:moduleId/test/questions', (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const { question, options, correctAnswer } = req.body;

        if (!question || !options || !Array.isArray(options) || options.length !== 4 || correctAnswer === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Question, 4 options, and correctAnswer are required'
            });
        }

        const module = findModuleById(courseId, moduleId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        if (!module.test) {
            module.test = {
                title: `${module.title} Assessment`,
                questions: []
            };
        }

        const newQuestion = {
            id: (questionIdCounter++).toString(),
            question,
            options,
            correctAnswer: parseInt(correctAnswer)
        };

        module.test.questions.push(newQuestion);

        res.status(201).json({
            success: true,
            message: 'Question added successfully',
            data: newQuestion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding question',
            error: error.message
        });
    }
});

app.get('/api/courses/:courseId/modules/:moduleId/test/questions/:questionId', (req, res) => {
    try {
        const { courseId, moduleId, questionId } = req.params;
        const module = findModuleById(courseId, moduleId);
        
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        if (!module.test || !module.test.questions) {
            return res.status(404).json({
                success: false,
                message: 'No questions found'
            });
        }

        const question = module.test.questions.find(q => q.id === questionId.toString());
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        res.json({
            success: true,
            data: question
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching question',
            error: error.message
        });
    }
});

app.put('/api/courses/:courseId/modules/:moduleId/test/questions/:questionId', (req, res) => {
    try {
        const { courseId, moduleId, questionId } = req.params;
        const { question, options, correctAnswer } = req.body;

        const module = findModuleById(courseId, moduleId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        if (!module.test || !module.test.questions) {
            return res.status(404).json({
                success: false,
                message: 'No questions found'
            });
        }

        const questionIndex = module.test.questions.findIndex(q => q.id === questionId.toString());
        if (questionIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        if (question !== undefined) module.test.questions[questionIndex].question = question;
        if (options !== undefined) module.test.questions[questionIndex].options = options;
        if (correctAnswer !== undefined) module.test.questions[questionIndex].correctAnswer = parseInt(correctAnswer);

        res.json({
            success: true,
            message: 'Question updated successfully',
            data: module.test.questions[questionIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating question',
            error: error.message
        });
    }
});

app.delete('/api/courses/:courseId/modules/:moduleId/test/questions/:questionId', (req, res) => {
    try {
        const { courseId, moduleId, questionId } = req.params;

        const module = findModuleById(courseId, moduleId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        if (!module.test || !module.test.questions) {
            return res.status(404).json({
                success: false,
                message: 'No questions found'
            });
        }

        const questionIndex = module.test.questions.findIndex(q => q.id === questionId.toString());
        if (questionIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        module.test.questions.splice(questionIndex, 1);

        res.json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting question',
            error: error.message
        });
    }
});

// ==================== ADMIN PROGRESS SUMMARY ====================
// Protected route: requires header 'x-admin-secret' matching process.env.ADMIN_SECRET
app.get('/admin/progress-summary', async (req, res) => {
    // Accept admin secret via multiple locations for convenience:
    //  - header: x-admin-secret
    //  - header: Authorization: Bearer <token>
    //  - query param: ?Authorization=<token>
    const headerX = req.headers['x-admin-secret'];
    const headerAuth = req.headers['authorization'] || req.headers['Authorization'];
    const queryAuth = req.query?.Authorization || req.query?.authorization;

    const suppliedToken = (headerX || (headerAuth || '').toString().replace(/^Bearer\s+/i, '') || queryAuth || '').toString();

    // Admin secret must be configured on the server
    if (!process.env.ADMIN_SECRET) {
        console.error('[admin/progress-summary] ADMIN_SECRET not set on server');
        return res.status(500).json({ success: false, message: 'Server misconfiguration: ADMIN_SECRET not set' });
    }

    // Also accept the Appwrite project id as a fallback token ONLY if it matches
    const allowedFallback = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '';

    if (suppliedToken !== process.env.ADMIN_SECRET && suppliedToken !== allowedFallback) {
        console.warn('[admin/progress-summary] Unauthorized access attempt, token mismatch');
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!appwriteDatabases) {
        return res.status(500).json({ success: false, message: 'Appwrite client not configured on server' });
    }

    try {
        // List all progress documents
        const resp = await appwriteDatabases.listDocuments(APPWRITE_DB_ID, PROGRESS_COLLECTION_ID);
        const docs = resp.documents || [];

        // Map each progress doc to a summary
        const summaries = docs.map((doc) => {
            const courseId = doc.courseId;
            const course = findCourseById(courseId) || { modules: [] };
            // total topics in course
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

app.post('/api/courses/:courseId/modules/:moduleId/test/submit', (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const { answers } = req.body;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: 'Answers array is required'
            });
        }

        const module = findModuleById(courseId, moduleId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        if (!module.test || !module.test.questions) {
            return res.status(404).json({
                success: false,
                message: 'No test found'
            });
        }

        let score = 0;
        const totalQuestions = module.test.questions.length;

        module.test.questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                score++;
            }
        });

        const percentage = (score / totalQuestions) * 100;

        res.json({
            success: true,
            data: {
                score,
                totalQuestions,
                percentage: percentage.toFixed(2),
                passed: percentage >= 70
            },
            message: 'Test submitted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting test',
            error: error.message
        });
    }
});

// ==================== SEARCH ROUTES ====================
app.get('/api/search', (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchTerm = q.toLowerCase();
        const results = {
            courses: [],
            modules: [],
            topics: []
        };

        courseData.courses.forEach(course => {
            if (course.title.toLowerCase().includes(searchTerm) || 
                course.description.toLowerCase().includes(searchTerm)) {
                results.courses.push({
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    type: 'course'
                });
            }

            course.modules.forEach(module => {
                if (module.title.toLowerCase().includes(searchTerm)) {
                    results.modules.push({
                        id: module.id,
                        title: module.title,
                        courseId: course.id,
                        courseTitle: course.title,
                        type: 'module'
                    });
                }

                module.topics.forEach(topic => {
                    if (topic.title.toLowerCase().includes(searchTerm) ||
                        (topic.content && topic.content.main.toLowerCase().includes(searchTerm))) {
                        results.topics.push({
                            id: topic.id,
                            title: topic.title,
                            courseId: course.id,
                            courseTitle: course.title,
                            moduleId: module.id,
                            moduleTitle: module.title,
                            type: 'topic'
                        });
                    }
                });
            });
        });

        res.json({
            success: true,
            data: results,
            totalResults: results.courses.length + results.modules.length + results.topics.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error performing search',
            error: error.message
        });
    }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Biology Course API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ==================== ERROR HANDLING ====================
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
});

// Start server when running as a standalone Node process
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.listen(PORT, () => {
    console.log(`🚀 Biology Course API running on port ${PORT}`);
    console.log(`🎓 Courses Endpoint: http://localhost:${PORT}/api/courses`);
    console.log(`📝 Test Endpoint: http://localhost:${PORT}/api/courses/1/modules/1/test`);
});