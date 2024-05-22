import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "@langchain/openai";
import fs from "fs";

import { CondensedVectorRecord, StatsData } from "@/lib/models";

export class LangChainVectorStoreSingleton {
	private static instance: LangChainVectorStoreSingleton;

	private store: HNSWLib | null;

	private static readonly DATA_FILE = process.cwd() + "/public/salaries.csv";

	private static readonly DATA: StatsData[] = [];

	private static readonly CONDENSED_DATA: Record<string, CondensedVectorRecord> = {};

	private constructor() {
		this.loadData();
		this.store = null;
	}

	public static getInstance(): LangChainVectorStoreSingleton {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!LangChainVectorStoreSingleton.instance) {
			LangChainVectorStoreSingleton.instance = new LangChainVectorStoreSingleton();
		}

		return LangChainVectorStoreSingleton.instance;
	}

	private loadData(): void {
		const text = fs.readFileSync(LangChainVectorStoreSingleton.DATA_FILE, "utf-8");
		const lines = text.split("\n");
		for (let i = 1; i < lines.length; i++) {
			const line = lines[i].split(",");
			LangChainVectorStoreSingleton.DATA.push({
				work_year: parseInt(line[0]),
				experience_level: line[1],
				employment_type: line[2],
				job_title: line[3],
				salary: parseFloat(line[4]),
				salary_currency: line[5],
				salary_in_usd: parseFloat(line[6]),
				employee_residence: line[7],
				remote_ratio: parseFloat(line[8]),
				company_location: line[9],
				company_size: line[10],
			});
		}
		this.condenseData();
	}

	private condenseData(): void {
		for (const datum of LangChainVectorStoreSingleton.DATA) {
			const key = `${datum.work_year}-${datum.job_title}`;
			if (key in LangChainVectorStoreSingleton.CONDENSED_DATA) {
				LangChainVectorStoreSingleton.CONDENSED_DATA[key].avg_salary += datum.salary;
				LangChainVectorStoreSingleton.CONDENSED_DATA[key].avg_salary_usd += datum.salary_in_usd;
				LangChainVectorStoreSingleton.CONDENSED_DATA[key].occurrences += 1;
			} else {
				LangChainVectorStoreSingleton.CONDENSED_DATA[key] = {
					year: datum.work_year,
					job_title: datum.job_title,
					avg_salary: parseFloat(datum.salary.toString()),
					avg_salary_usd: parseFloat(datum.salary_in_usd.toString()),
					occurrences: 1,
				};
			}
		}
		for (const key in LangChainVectorStoreSingleton.CONDENSED_DATA) {
			LangChainVectorStoreSingleton.CONDENSED_DATA[key].avg_salary = parseFloat(
				(
					LangChainVectorStoreSingleton.CONDENSED_DATA[key].avg_salary /
					LangChainVectorStoreSingleton.CONDENSED_DATA[key].occurrences
				).toFixed(2)
			);
			LangChainVectorStoreSingleton.CONDENSED_DATA[key].avg_salary_usd = parseFloat(
				(
					LangChainVectorStoreSingleton.CONDENSED_DATA[key].avg_salary_usd /
					LangChainVectorStoreSingleton.CONDENSED_DATA[key].occurrences
				).toFixed(2)
			);
		}
	}

	public static getRecords(): CondensedVectorRecord[] {
		return Object.values(LangChainVectorStoreSingleton.CONDENSED_DATA);
	}

	public async getStore(): Promise<HNSWLib> {
		const statsDataAsString = (data: CondensedVectorRecord): string => {
			return `In ${data.year}, the average salary for a ${data.job_title} was ${data.avg_salary} and ${data.avg_salary_usd} in USD with ${data.occurrences} occurrences.`;
		};

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!this.store) {
			this.store = await HNSWLib.fromTexts(
				LangChainVectorStoreSingleton.getRecords().map((record) => statsDataAsString(record)),
				LangChainVectorStoreSingleton.getRecords().map((_, index) => ({ id: index + 1 })),
				new OpenAIEmbeddings({})
			);
		}

		return this.store;
	}
}
