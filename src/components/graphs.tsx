"use client";

import { parse } from "csv-parse";
import React from "react";
import { HashLoader } from "react-spinners";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { StatsData } from "@/lib/models";

import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface GraphData {
	job_title: string;
	salary: number;
	salary_in_usd: number;
}

export default function AnalyticGraphs(): React.JSX.Element {
	const [loading, setLoading] = React.useState<boolean>(true);
	const [graphData, setGraphData] = React.useState<Record<number, GraphData[]>>({});
	const [groupByKey, setGroupByKey] = React.useState<string>("job_title");

	const groupBy = React.useCallback((data: Record<string, GraphData[]>, key: string) => {
		const groupedData: Record<string, number> = {};
		switch (key) {
			case "job_title":
				Object.keys(data).forEach((year) => {
					groupedData[year] = data[year].length;
				});
				break;
			case "salary":
			case "salary_in_usd":
				Object.keys(data).forEach((year) => {
					groupedData[year] = parseFloat(
						(
							data[year].reduce((acc, curr) => acc + parseFloat(curr[key].toString()), 0) /
							data[year].length
						).toFixed(2)
					);
				});
				break;
			default:
				break;
		}
		return groupedData;
	}, []);

	React.useEffect(() => {
		void fetch("/salaries.csv")
			.then((response) => response.text())
			.then((text) => {
				parse(text, { columns: true }, (err, data) => {
					if (err) {
						console.error(err);
						return;
					}
					setLoading(false);
					const graphData: Record<number, GraphData[]> = {};
					(data as StatsData[]).forEach((row) => {
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
						if (!graphData[row.work_year]) {
							graphData[row.work_year] = [];
						}
						graphData[row.work_year].push({
							job_title: row.job_title,
							salary: row.salary,
							salary_in_usd: row.salary_in_usd,
						});
					});
					setGraphData(graphData);
				});
			});
	}, []);

	if (loading) {
		return (
			<div className="flex h-96 w-full items-center justify-center">
				<HashLoader size={64} color="#36c2d6" />
			</div>
		);
	}

	return (
		<>
			<h1 className="py-8 text-center text-3xl font-bold">Graphical Analysis</h1>
			<div className="flex min-h-96 w-full flex-col items-center justify-center rounded-md border p-4">
				<div className="flex w-full flex-row items-center justify-between px-4">
					<span className="flex flex-row gap-4 text-lg font-semibold">
						Grouped By: <p className="text-blue-500">{groupByKey}</p>
					</span>
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Button variant="outline">Group By</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>Group By</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={(): void => setGroupByKey("job_title")}>
									Job Title
								</DropdownMenuItem>
								<DropdownMenuItem onClick={(): void => setGroupByKey("salary")}>
									Salary
								</DropdownMenuItem>
								<DropdownMenuItem onClick={(): void => setGroupByKey("salary_in_usd")}>
									Salary in USD
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={(): void => setGroupByKey("job_title")}>Reset</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<ResponsiveContainer width="100%" height={400} className="mt-8">
					<AreaChart
						data={Object.keys(graphData).map((year) => ({
							year: parseInt(year, 10),
							[groupByKey]: groupBy(graphData, groupByKey)[year],
						}))}>
						<defs>
							<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#36c2d6" stopOpacity={0.8} />
								<stop offset="95%" stopColor="#36c2d6" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="year" />
						<YAxis />
						<Tooltip
							cursor={{ fill: "transparent" }}
							contentStyle={{
								backgroundColor: "hsl(var(--secondary))",
								borderRadius: "3px",
							}}
						/>
						<Area type="monotone" dataKey={groupByKey} stroke="#36c2d6" fill="url(#colorUv)" />
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</>
	);
}
