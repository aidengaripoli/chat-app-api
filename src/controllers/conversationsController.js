const mongoose = require('mongoose')
const Message = mongoose.model('Message')
const Conversation = mongoose.model('Conversation')

exports.all = async (req, res) => {
  // fetch all conversation ids
  const conversations = await Conversation.find({ participants: req.user._id }).select('_id')

  // loop through each conversation id, fetch all the messages for the conversation
  // const fullConversations = []
  const fullConversations = {}
  for (let conversation of conversations) {
    const messages = await Message
      .find({ conversationId: conversation })
      .sort({ createdAt: -1 })
      // .limit(1)
      .populate({
        path: 'user',
        select: 'name'
      })
    // fullConversations.push(messages)
    fullConversations[conversation._id] = messages
  }

  res.status(200).json(fullConversations)
}
