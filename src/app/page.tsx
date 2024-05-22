import Link from "next/link";
import React from "react";
import { FaUsers } from "react-icons/fa";
import { IoIosHome, IoIosSearch, IoIosSettings } from "react-icons/io";
import { LuMessagesSquare } from "react-icons/lu";

import Conversation from "@/components/conversation";
import AnalyticGraphs from "@/components/graphs";
import StatsTable from "@/components/stats-table";
import { Input } from "@/components/ui/input";

export default function Home(): React.JSX.Element {
	return (
		<div className="flex h-screen w-full overflow-hidden">
			<div className="hidden w-64 shrink-0 border border-r bg-secondary/20 lg:block">
				<div className="flex h-full flex-col">
					<div className="flex h-16 items-center justify-between border-b px-6">
						<div className="text-lg font-semibold tracking-tight">Admin Panel</div>
					</div>
					<nav className="flex flex-1 flex-col space-y-2 px-4 py-6">
						<Link
							className="flex items-center rounded-md bg-muted px-3 py-3 text-sm font-medium transition-colors hover:bg-muted"
							href="#">
							<IoIosHome className="mr-3 h-5 w-5" />
							Dashboard
						</Link>
						<Link
							className="flex items-center rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-muted"
							href="#">
							<FaUsers className="mr-3 h-5 w-5" />
							Customers
						</Link>
						<Link
							className="flex items-center rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-muted"
							href="#">
							<LuMessagesSquare className="mr-3 h-5 w-5" />
							Conversations
						</Link>
						<Link
							className="flex items-center rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-muted"
							href="#">
							<IoIosSettings className="mr-3 h-5 w-5" />
							Settings
						</Link>
					</nav>
				</div>
			</div>
			<div className="flex flex-1 flex-col">
				<header className="flex h-16 shrink-0 items-center border-y bg-secondary/20 px-6">
					<div className="mr-auto text-lg font-semibold tracking-tight">Analytics</div>
					<div className="flex items-center space-x-4">
						<form className="relative">
							<IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
							<Input
								className="pl-10 pr-4 focus:border-gray-400 dark:bg-gray-800 dark:text-gray-50"
								placeholder="Search..."
								type="search"
							/>
						</form>
					</div>
				</header>
				<main className="flex-1 overflow-y-auto">
					<div className="px-6 py-8">
						<div className="grid grid-cols-1">
							<StatsTable />
							<AnalyticGraphs />
						</div>
					</div>
				</main>
			</div>
			<div className="hidden w-96 shrink-0 border-l bg-secondary/20 lg:block">
				<Conversation />
			</div>
		</div>
	);
}
