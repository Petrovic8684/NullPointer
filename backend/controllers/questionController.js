const User = require("../models/userModel.js");
const Question = require("../models/questionModel.js");
const Answer = require("../models/answerModel.js");

// @desc    Fetches all questions (with optional filters and pagination).
// @route   GET /questions
// @access  Public
const fetchAllQuestions = async (req, res) => {
  const {
    minViews,
    maxViews,
    createdAfter,
    createdBefore,
    updatedAfter,
    updatedBefore,
    minAnswers,
    maxAnswers,
    page,
    limit,
    search,
  } = req.query;

  try {
    const filter = {};

    // Filters for view count.
    if (minViews !== undefined)
      filter.views = { ...(filter.views || {}), $gte: Number(minViews) };
    if (maxViews !== undefined)
      filter.views = { ...(filter.views || {}), $lte: Number(maxViews) };

    // Filters for created at.
    if (createdAfter !== undefined)
      filter.createdAt = {
        ...(filter.createdAt || {}),
        $gte: new Date(createdAfter),
      };
    if (createdBefore !== undefined)
      filter.createdAt = {
        ...(filter.createdAt || {}),
        $lte: new Date(createdBefore),
      };

    // Filters for updated at.
    if (updatedAfter !== undefined)
      filter.updatedAt = {
        ...(filter.updatedAt || {}),
        $gte: new Date(updatedAfter),
      };
    if (updatedBefore !== undefined)
      filter.updatedAt = {
        ...(filter.updatedAt || {}),
        $lte: new Date(updatedBefore),
      };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } }, // By title content
        { body: { $regex: search, $options: "i" } }, // By body content
      ];
    }

    let questions = await Question.find(filter)
      .populate("answers")
      .populate("author", "username")
      .lean()
      .sort({ createdAt: -1 });

    // Filters for answers count.
    if (minAnswers !== undefined) {
      questions = questions.filter(
        (q) => q.answers.length >= Number(minAnswers)
      );
    }
    if (maxAnswers !== undefined) {
      questions = questions.filter(
        (q) => q.answers.length <= Number(maxAnswers)
      );
    }

    if (!page || !limit || page <= 0 || limit <= 0)
      return res.status(200).json(questions);

    // Pagination
    const skip = (page - 1) * limit;
    const questionsLength = questions.length;
    questions = questions.slice(skip, skip + Number(limit));

    res.status(200).json({
      total: questionsLength,
      page: Number(page),
      totalPages: Math.ceil(questionsLength / limit),
      questions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetches question with id.
// @route   GET /questions/:id
// @access  Public
const fetchOneQuestion = async (req, res) => {
  const questionId = req.params.id;

  try {
    const question = await Question.findById(questionId)
      .populate("author", "username")
      .exec();

    if (!question) return res.status(404).send("Question not found!");

    res.status(200).send(question);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

// @desc    Fetches all questions of a user with id ( with optional filters and pagination).
// @route   GET /questions/byUser/:id
// @access  Public
const fetchAllQuestionsByUser = async (req, res) => {
  const {
    createdAfter,
    createdBefore,
    updatedAfter,
    updatedBefore,
    page,
    limit,
  } = req.query;

  const { id: userId } = req.params;

  try {
    const filter = {};

    // Filters for created at.
    if (createdAfter !== undefined)
      filter.createdAt = {
        ...(filter.createdAt || {}),
        $gte: new Date(createdAfter),
      };
    if (createdBefore !== undefined)
      filter.createdAt = {
        ...(filter.createdAt || {}),
        $lte: new Date(createdBefore),
      };

    // Filters for updated at.
    if (updatedAfter !== undefined)
      filter.updatedAt = {
        ...(filter.updatedAt || {}),
        $gte: new Date(updatedAfter),
      };
    if (updatedBefore !== undefined)
      filter.updatedAt = {
        ...(filter.updatedAt || {}),
        $lte: new Date(updatedBefore),
      };

    let questions = await Question.find({ author: userId, ...filter })
      .lean()
      .sort({ createdAt: -1 });

    if (!page || !limit || page <= 0 || limit <= 0)
      return res.status(200).json(questions);

    // Pagination
    const skip = (page - 1) * limit;
    const questionsLength = questions.length;
    questions = questions.slice(skip, skip + Number(limit));

    res.status(200).json({
      total: questionsLength,
      page: Number(page),
      totalPages: Math.ceil(questionsLength / limit),
      questions,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Adds a new question.
// @route   POST /questions
// @access  User only
const addQuestion = async (req, res) => {
  const { title, body } = req.body;
  const userId = req.user._id; // authMiddleware populates req.user field.

  try {
    // Reward user if this is their first question of the day.
    const user = await User.findById(userId);

    const today = new Date();
    const lastRewardDate = user.lastQuestionReward
      ? new Date(user.lastQuestionReward)
      : null;

    if (
      !lastRewardDate ||
      today.toDateString() !== lastRewardDate.toDateString()
    ) {
      user.reputation += 5;
      user.lastQuestionReward = today;
      await user.save();
    }

    const newQuestion = new Question({
      title,
      body,
      author: userId,
    });

    await newQuestion.save();

    const populatedQuestion = await Question.findById(newQuestion._id).populate(
      "author",
      "username"
    );

    res.status(201).send(populatedQuestion);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// @desc    Updates a question with id.
// @route   PUT /questions/:id
// @access  User only
const updateQuestion = async (req, res) => {
  const questionId = req.params.id;
  const { title, body } = req.body;

  try {
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).send("Question not found!");

    // Checks if user is the author. authMiddleware populates req.user field.
    if (question.author.toString() !== req.user._id.toString())
      return res.status(403).send("Unauthorized to update this question!");

    question.title = title;
    question.body = body;
    await question.save();

    res.status(200).send(question);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// @desc    Deletes a question with id.
// @route   DELETE /questions/:id
// @access  User only
const deleteQuestion = async (req, res) => {
  const questionId = req.params.id;

  try {
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).send("Question not found!");

    // Checks if user is admin or the author. authMiddleware populates req.user field.
    if (
      !req.user.isAdmin &&
      question.author.toString() !== req.user._id.toString()
    )
      return res.status(403).send("Unauthorized to delete this question!");

    await Answer.deleteMany({ question });

    await question.deleteOne();
    res.status(200).send(question);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// @desc    Updates the view count for question with id.
// @route   POST /questions/:id/viewed
// @access  Public
const updateViewCountOnQuestion = async (req, res) => {
  const questionId = req.params.id;

  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!updatedQuestion)
      return res.status(404).json({ message: "Question not found!" });

    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  fetchAllQuestions,
  fetchOneQuestion,
  fetchAllQuestionsByUser,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  updateViewCountOnQuestion,
};
