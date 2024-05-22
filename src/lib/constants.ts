import { Metadata } from "next";

export const meta: Metadata = {
	title: "Rag Analytics",
	metadataBase: new URL(String(process.env.NEXT_PUBLIC_BASE_URL)),
	description: "A basic analytics dashboard with a llm based rag enabled ai chatbot",
	keywords: ["Rag", "AI", "Chatbot", "Analytics", "Dashboard"],
	authors: [{ name: "FallenDeity" }],
	robots: {
		follow: true,
		index: true,
		nocache: true,
	},
	openGraph: {
		url: new URL(String(process.env.NEXT_PUBLIC_BASE_URL)),
		title: "Rag Analytics",
		description: "A basic analytics dashboard with a llm based rag enabled ai chatbot",
		type: "website",
	},
	twitter: {
		images: "/logo.png",
		card: "summary",
	},
	themeColor: "#9d57ff",
};
