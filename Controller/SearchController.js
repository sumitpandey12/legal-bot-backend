const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { retriever } = require("../Utils/retriever");
const {
  RunnableSequence,
  RunnablePassthrough,
} = require("@langchain/core/runnables");

const answerTemplate = `You are a helpful and enthusiastic legal assistent who can answer a given question about legal queries based on the context provided and chatHistory. 
you are allowed to reply the greeting by ignoring the context if the question is about greeting.
If you really don't know the answer in context and chatHistory, say "I'm sorry, I don't know the answer to that." 
And direct the questioner to email help@sumit.com. Don't try to make up an answer. 
Always speak as if you were chatting to a friend.
context: {context}
question: {question}
chatHistory: {chatHistory}`;

const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

function combineDocuments(docs) {
  return docs.map((doc) => doc.pageContent).join("\n\n");
}

async function standaloneQuestion({ question, chatHistory }) {
  if (!question) {
    return "Please provide a question";
  }
  try {
    const openAIApiKey = process.env.OPENAI_API_KEY;
    const llm = new ChatOpenAI({ openAIApiKey });
    const standaloneQuestionTemplate =
      "Given a question, convert it to a standalone question. question: {question} standalone question:";
    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
      standaloneQuestionTemplate
    );

    const standaloneQuestionChain = standaloneQuestionPrompt
      .pipe(llm)
      .pipe(new StringOutputParser());

    const retrieverChain = RunnableSequence.from([
      (prevResult) => prevResult.standalone_question,
      retriever,
      combineDocuments,
    ]);

    const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());

    const chain = RunnableSequence.from([
      {
        standalone_question: standaloneQuestionChain,
        original_input: new RunnablePassthrough(),
      },
      {
        context: retrieverChain,
        question: ({ original_input }) => original_input.question,
        chatHistory: () => chatHistory,
      },
      answerChain,
    ]);

    const response = await chain.invoke({ question });
    return {
      message: response,
      standaloneQuestion: response.standalone_question,
      chatHistory: chatHistory,
    };
  } catch (error) {
    console.log(error);
  }
}

const SearchController = {
  async search(req, res) {
    const { question, chatHistory } = req.body;
    if (!question) {
      return res.status(400).json({
        status: "success",
        data: "Please provide a question",
      });
    }

    const response = await standaloneQuestion({
      question: question,
      chatHistory: chatHistory,
    });

    res.json({
      status: "success",
      data: response,
    });
  },

  // async clearChatHistory(req, res) {
  //   chatHistory = [];
  //   res.json({
  //     status: "success",
  //     message: "Chat history cleared successfully",
  //     data: chatHistory,
  //   });
  // },

  // async getChatHistory(req, res) {
  //   res.json({
  //     status: "success",
  //     message: "Chat history fetched successfully",
  //     data: chatHistory,
  //   });
  // },
};

module.exports = SearchController;
