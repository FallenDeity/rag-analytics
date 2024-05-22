"use client";

import { ColumnDef, Table } from "@tanstack/react-table";
import { parse } from "csv-parse";
import React from "react";
import { BsThreeDots } from "react-icons/bs";
import { HashLoader } from "react-spinners";

import { StatsData } from "@/lib/models";

import { DataTableColumnHeader } from "./data-table/header";
import DataTable from "./data-table/table";
import { DataTableViewOptions } from "./data-table/toggle";
import { Button } from "./ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";
import { Input } from "./ui/input";

interface MainTableProps {
	year: number;
	num_jobs: number;
	avg_salary: number;
	avg_salary_usd: number;
}

interface SecondaryTableProps {
	year: number;
	job_title: string;
	occurrences: number;
	avg_salary: number;
	avg_salary_usd: number;
}

const columns: ColumnDef<StatsData>[] = [
	{
		accessorKey: "work_year",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Year" />,
	},
	{
		accessorKey: "experience_level",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Experience" />,
	},
	{
		accessorKey: "employment_type",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Employment" />,
	},
	{
		accessorKey: "job_title",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Title" />,
		cell: ({ row }): React.JSX.Element => {
			const title = row.original.job_title;
			return (
				<span className="line-clamp-1 flex min-w-[180px] items-center justify-center text-center">{title}</span>
			);
		},
	},
	{
		accessorKey: "salary",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Salary" />,
		cell: ({ row }): React.JSX.Element => {
			const salary = parseFloat(row.original.salary.toString());
			return <span>{salary.toLocaleString()}</span>;
		},
	},
	{
		accessorKey: "salary_currency",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Currency" />,
	},
	{
		accessorKey: "salary_in_usd",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="USD" />,
		cell: ({ row }): React.JSX.Element => {
			const salaryInUsd = parseFloat(row.original.salary_in_usd.toString());
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(salaryInUsd);
			return <span>{formatted}</span>;
		},
	},
	{
		accessorKey: "employee_residence",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Residence" />,
	},
	{
		accessorKey: "remote_ratio",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Remote" />,
	},
	{
		accessorKey: "company_location",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Location" />,
	},
	{
		accessorKey: "company_size",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Size" />,
	},
];

const secondaryColumns: ColumnDef<SecondaryTableProps>[] = [
	{
		accessorKey: "year",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Year" />,
	},
	{
		accessorKey: "job_title",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Job Title" />,
	},
	{
		accessorKey: "occurrences",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Occurrences" />,
	},
	{
		accessorKey: "avg_salary",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Average Salary" />,
		cell: ({ row }): React.JSX.Element => {
			const avgSalary = parseFloat(row.original.avg_salary.toString());
			return <span>{avgSalary.toLocaleString()}</span>;
		},
	},
	{
		accessorKey: "avg_salary_usd",
		header: ({ column }): React.JSX.Element => (
			<DataTableColumnHeader column={column} title="Average Salary in USD" />
		),
		cell: ({ row }): React.JSX.Element => {
			const avgSalaryUsd = parseFloat(row.original.avg_salary_usd.toString());
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(avgSalaryUsd);
			return <span>{formatted}</span>;
		},
	},
];

const mainColumns: ColumnDef<MainTableProps>[] = [
	{
		accessorKey: "year",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Year" />,
	},
	{
		accessorKey: "num_jobs",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Number of Jobs" />,
	},
	{
		accessorKey: "avg_salary",
		header: ({ column }): React.JSX.Element => <DataTableColumnHeader column={column} title="Average Salary" />,
		cell: ({ row }): React.JSX.Element => {
			const avgSalary = parseFloat(row.original.avg_salary.toString());
			return <span>{avgSalary.toLocaleString()}</span>;
		},
	},
	{
		accessorKey: "avg_salary_usd",
		header: ({ column }): React.JSX.Element => (
			<DataTableColumnHeader column={column} title="Average Salary in USD" />
		),
		cell: ({ row }): React.JSX.Element => {
			const avgSalaryUsd = parseFloat(row.original.avg_salary_usd.toString());
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(avgSalaryUsd);
			return <span>{formatted}</span>;
		},
	},
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }): React.JSX.Element => {
			const year = row.original.year;
			const [loading, setLoading] = React.useState<boolean>(true);
			const [jobData, setJobData] = React.useState<SecondaryTableProps[]>([]);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const [_table, setTable] = React.useState<Table<SecondaryTableProps>>();

			React.useEffect(() => {
				void fetch("/salaries.csv")
					.then((response) => response.text())
					.then((text) => {
						parse(
							text,
							{
								delimiter: ",",
								columns: true,
								skip_empty_lines: true,
							},
							(err, records) => {
								if (err) {
									console.error(err);
									return;
								}
								setLoading(false);

								const jobData: Record<string, SecondaryTableProps> = {};
								(records as StatsData[]).forEach((record) => {
									if (record.work_year === year) {
										const title = record.job_title;
										// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
										if (!jobData[title]) {
											jobData[title] = {
												year: record.work_year,
												job_title: title,
												occurrences: 0,
												avg_salary: 0,
												avg_salary_usd: 0,
											};
										}
										jobData[title].occurrences += 1;
										jobData[title].avg_salary += parseFloat(record.salary.toString());
										jobData[title].avg_salary_usd += parseFloat(record.salary_in_usd.toString());
									}
								});
								const jobDataArray = Object.values(jobData).map((record) => {
									record.avg_salary /= record.occurrences;
									record.avg_salary_usd /= record.occurrences;
									return record;
								});
								setJobData(jobDataArray);
							}
						);
					});
			}, [year]);
			return (
				<Drawer>
					<DrawerTrigger asChild>
						<Button className="m-0 h-6 w-6 p-0" variant="ghost">
							<BsThreeDots className="h-4 w-4" />
						</Button>
					</DrawerTrigger>
					<DrawerContent className="h-2/3">
						<div className="mx-auto my-4 flex w-full max-w-7xl flex-col items-center justify-evenly">
							<DrawerHeader>
								<DrawerTitle className="text-center text-3xl">Job Analytics</DrawerTitle>
								<DrawerDescription className="text-center">
									Analytics for jobs in {year}
								</DrawerDescription>
							</DrawerHeader>
							<div className="flex h-full w-full flex-col items-center justify-center">
								{loading ? (
									<HashLoader size={50} color="#36c2d6" />
								) : (
									<DataTable
										classNames="flex flex-col max-h-96"
										setTable={setTable}
										columns={secondaryColumns}
										data={jobData}
									/>
								)}
							</div>
						</div>
					</DrawerContent>
				</Drawer>
			);
		},
	},
];

export default function StatsTable(): React.JSX.Element {
	const [table, setTable] = React.useState<Table<StatsData>>();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_mainTable, setMainTable] = React.useState<Table<MainTableProps>>();
	const [mainData, setMainData] = React.useState<MainTableProps[]>([]);
	const [data, setData] = React.useState<StatsData[]>([]);
	const [filter, setFilter] = React.useState<string>("");
	const [loading, setLoading] = React.useState<boolean>(true);

	React.useEffect(() => {
		void fetch("/salaries.csv")
			.then((response) => response.text())
			.then((text) => {
				parse(
					text,
					{
						delimiter: ",",
						columns: true,
						skip_empty_lines: true,
					},
					(err, records) => {
						if (err) {
							console.error(err);
							return;
						}
						setData(records as StatsData[]);
						setLoading(false);

						const mainData: Record<number, MainTableProps> = {};
						(records as StatsData[]).forEach((record) => {
							const year = record.work_year;
							// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
							if (!mainData[year]) {
								mainData[year] = {
									year,
									num_jobs: 0,
									avg_salary: 0,
									avg_salary_usd: 0,
								};
							}
							mainData[year].num_jobs += 1;
							mainData[year].avg_salary += parseFloat(record.salary.toString());
							mainData[year].avg_salary_usd += parseFloat(record.salary_in_usd.toString());
						});
						const mainDataArray = Object.values(mainData).map((record) => {
							record.avg_salary /= record.num_jobs;
							record.avg_salary_usd /= record.num_jobs;
							return record;
						});
						setMainData(mainDataArray);
					}
				);
			});
	}, []);

	React.useEffect(() => {
		if (table) {
			table.getColumn("job_title")?.setFilterValue(filter);
		}
	}, [filter]);

	if (loading) {
		return (
			<div className="flex h-96 w-full items-center justify-center">
				<HashLoader size={64} color="#36c2d6" />
			</div>
		);
	}

	return (
		<div className="flex w-full flex-col items-center justify-center">
			<div className="flex w-full flex-col items-center gap-2 pb-6">
				<h2 className="text-2xl font-bold">Compound Analytics Table</h2>
				<span className="text-sm text-gray-400">Click the three dots to view job analytics</span>
			</div>
			<div className="flex w-full flex-col items-center gap-1 rounded-md border p-4 sm:gap-4">
				<DataTable setTable={setMainTable} columns={mainColumns} data={mainData} />
			</div>
			<div className="flex w-full flex-col items-center gap-1 py-8 sm:gap-4">
				<h2 className="text-2xl font-bold">Detailed Analytics Table</h2>
			</div>
			<div className="flex w-full flex-col items-center gap-1 rounded-md border p-4 sm:gap-4">
				{table && (
					<div className="flex w-full items-center gap-1 pb-4 sm:gap-4">
						<Input
							placeholder="Filter jobs..."
							value={filter}
							onChange={(e): void => setFilter(e.target.value)}
							className="max-w-sm"
						/>
						<DataTableViewOptions table={table} />
					</div>
				)}
				<DataTable setTable={setTable} columns={columns} data={data} />
			</div>
		</div>
	);
}
