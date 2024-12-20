const User = require("../models/userModel.js");

// @desc  Handles the logic if the user has already voted.
const handleExistingVote = async (existingVote, vote, userId, answer, res) => {
  if (existingVote.vote === vote) {
    await retractVote(vote, userId, answer);
  } else {
    await switchVote(vote, userId, answer);
  }

  const author = await User.findById(answer.author);

  return res.status(200).json({
    answer: answer,
    newUserReputation: author ? author.reputation : null,
  });
};

// @desc  Retracts a users vote.
const retractVote = async (vote, userId, answer) => {
  answer.totalVoteScore -= vote === "upvote" ? 1 : -1;
  answer.userVotes = answer.userVotes.filter(
    (v) => v.user._id.toString() !== userId.toString()
  );

  answer.populate("userVotes.user", "username");

  await answer.save();

  // Update reputation of answer author
  const author = await User.findById(answer.author);
  if (author) {
    author.reputation -= vote === "upvote" ? 1 : -1;
    await author.save();
  }
};

// @desc  Switches the users vote from one to another.
const switchVote = async (vote, userId, answer) => {
  answer.totalVoteScore += vote === "upvote" ? 2 : -2;
  answer.userVotes = answer.userVotes.map((v) =>
    v.user._id.toString() === userId.toString() ? { ...v, vote: vote } : v
  );

  answer.populate("userVotes.user", "username");

  await answer.save();

  // Update reputation of answer author
  const author = await User.findById(answer.author);
  if (author) {
    author.reputation += vote === "upvote" ? 2 : -2;
    await author.save();
  }
};

// @desc  Adds a new vote if the user hasn't voted before.
const handleNewVote = async (vote, userId, answer, res) => {
  answer.totalVoteScore += vote === "upvote" ? 1 : -1;
  answer.userVotes.push({ user: { _id: userId }, vote: vote });

  answer.populate("userVotes.user", "username");

  await answer.save();

  // Update reputation of answer author
  const author = await User.findById(answer.author);
  if (author) {
    author.reputation += vote === "upvote" ? 1 : -1;
    await author.save();
  }

  return res
    .status(200)
    .json({ answer: answer, newUserReputation: author.reputation });
};

module.exports = { handleNewVote, handleExistingVote };
