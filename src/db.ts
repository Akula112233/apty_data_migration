import { Pool } from "pg";

const initiatePools = (sourceString: string, destString: string) => {
	const pool = new Pool({
		connectionString: sourceString,
	});

	const destPool = new Pool({
		connectionString: destString,
	});

	return { pool, destPool };
};

export { initiatePools };
