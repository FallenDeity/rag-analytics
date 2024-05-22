"use server";

import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { formatDocumentsAsString } from "langchain/util/document";

import { ConversationalRetrievalQAChainInput } from "@/lib/models";
import { LangChainVectorStoreSingleton } from "@/lib/store";

export async function getResponse(message: string, context: string[]): Promise<string> {
	const formatContext = (context: string[]): string => {
		let string = "";
		for (let i = 0; i < context.length; i++) {
			const speaker = i % 2 === 0 ? "Assistant" : "Human";
			string += `${speaker}: "${context[i]}"\n`;
		}
		return string;
	};

	const model = new ChatOpenAI({
		temperature: 0.8,
		verbose: true,
	});

	const questionPrompt = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

	Chat History:
	{chat_history}
	Follow Up Input: {question}
	Standalone question:`;
	const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(questionPrompt);
	const answerPrompt = `You are given the following context and a question. As a business and data analytics assistant, provide a response to the question based on the context. Remember to rephrase and provide a clear and concise and professional response.
    {context}

    Question: {question}`;
	const CONDENSE_ANSWER_PROMPT = PromptTemplate.fromTemplate(answerPrompt);

	const store = LangChainVectorStoreSingleton.getInstance();
	const retreiver = (await store.getStore()).asRetriever(3);

	const questionChain = RunnableSequence.from([
		{
			question: (input: ConversationalRetrievalQAChainInput) => input.question,
			chat_history: (input: ConversationalRetrievalQAChainInput) => formatContext(input.chat_history),
		},
		CONDENSE_QUESTION_PROMPT,
		model,
		new StringOutputParser(),
	]);

	const answerChain = RunnableSequence.from([
		{
			context: retreiver.pipe(formatDocumentsAsString),
			question: new RunnablePassthrough(),
		},
		CONDENSE_ANSWER_PROMPT,
		model,
	]);

	const conversationalRetrievalQAChain = questionChain.pipe(answerChain);

	const result = await conversationalRetrievalQAChain.invoke({
		question: message,
		chat_history: context,
	});

	return result.content.toString();
}
