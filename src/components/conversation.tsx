"use client";

import moment from "moment";
import React from "react";
import { IoMdSend } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

import { getResponse } from "@/actions/getResponse";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
	sender: "Assistant" | "Human";
	text: string;
	sent_at: Date;
}

export default function Conversation(): React.JSX.Element {
	const messageContainer = React.useRef<HTMLDivElement>(null);
	const [messages, setMessages] = React.useState<Message[]>([]);
	const [message, setMessage] = React.useState<string>("");
	const [loading, setLoading] = React.useState<boolean>(false);

	const sendMessage = async (): Promise<void> => {
		setLoading(true);
		const history = messages.map((message) => message.text).slice(-3);
		const response = await getResponse(message, history);
		setMessages((messages) => [...messages, { sender: "Human", text: message, sent_at: new Date() }]);
		setMessages((messages) => [...messages, { sender: "Assistant", text: response, sent_at: new Date() }]);
		setMessage("");
		setLoading(false);
	};

	React.useEffect(() => {
		messageContainer.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="flex h-full flex-col">
			<div className="flex h-16 items-center justify-between border-b px-6">
				<div className="text-lg font-semibold tracking-tight">Conversation</div>
				<Button size="icon" variant="ghost">
					<RxCross2 className="h-5 w-5" />
					<span className="sr-only">Close</span>
				</Button>
			</div>
			<div className="flex-1 overflow-y-auto p-6">
				{messages.length === 0 && (
					<div className="flex h-full items-center justify-center">
						<p className="text-gray-500 dark:text-gray-400">No messages yet</p>
					</div>
				)}
				<div className="space-y-4">
					{messages.map((message, index) => (
						<div
							key={index}
							className={`flex items-start space-x-4 ${
								message.sender === "Assistant" ? "justify-end" : ""
							}`}>
							{message.sender === "Assistant" && (
								<Avatar className="h-10 w-10">
									<AvatarImage alt="Assistant" src="/placeholder-avatar.jpg" />
									<AvatarFallback>AS</AvatarFallback>
								</Avatar>
							)}
							<div className="flex-1">
								<div
									className={`rounded-lg p-4 text-sm ${
										message.sender === "Assistant"
											? "bg-blue-500 text-white"
											: "bg-gray-100 dark:bg-gray-800"
									}`}>
									<p>{message.text}</p>
								</div>
								<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
									{message.sender} • {moment(message.sent_at).fromNow()}
								</p>
							</div>
							{message.sender === "Human" && (
								<Avatar className="h-10 w-10">
									<AvatarImage alt="You" src="/placeholder-avatar.jpg" />
									<AvatarFallback>YO</AvatarFallback>
								</Avatar>
							)}
						</div>
					))}
				</div>
				<div ref={messageContainer} />
			</div>
			<form className="my-3 flex flex-row items-center justify-evenly space-x-4 px-2">
				<Input
					disabled={loading}
					value={message}
					onChange={(e): void => setMessage(e.target.value)}
					className="h-11 flex-1"
					placeholder="Type your message..."
				/>
				<Button
					onClick={(): void => void sendMessage()}
					disabled={loading}
					variant="ghost"
					className="m-0 flex items-center justify-center rounded-full p-0 hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-40">
					<IoMdSend className="h-7 w-7 text-white" />
				</Button>
			</form>
		</div>
	);
}
