const mongoose = require('mongoose')
const Message = mongoose.model('Message')
const Conversation = mongoose.model('Conversation')

exports.all = async (req, res) => {
  // fetch all conversation
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants')

  const fullConversations = {}
  for (let conversation of conversations) {
    const messages = await Message
      .find({ conversationId: conversation })
      .sort({ createdAt: -1 })
      .limit(10) // get last 10 messages
      .populate({
        path: 'user',
        select: 'name'
      })
    fullConversations[conversation._id] = {
      messages: messages.reverse(),
      participants: conversation.participants
    }
  }

  res.status(200).json(fullConversations)
}

exports.create = async (req, res) => {
  let participants = [req.user._id, ...req.body]
  const conversation = new Conversation({ participants })
  await conversation.save()
  const newConversation = await Conversation.findById(conversation._id)
    .populate('participants')
  res.status(201).json(newConversation)
}
