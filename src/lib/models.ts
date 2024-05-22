export interface StatsData {
	work_year: number;
	experience_level: string;
	employment_type: string;
	job_title: string;
	salary: number;
	salary_currency: string;
	salary_in_usd: number;
	employee_residence: string;
	remote_ratio: number;
	company_location: string;
	company_size: string;
}

export interface ConversationalRetrievalQAChainInput {
	question: string;
	chat_history: string[];
}

export interface CondensedVectorRecord {
	year: number;
	job_title: string;
	avg_salary: number;
	avg_salary_usd: number;
	occurrences: number;
}
