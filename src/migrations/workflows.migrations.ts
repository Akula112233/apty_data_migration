// prettier-ignore
import { getFlows, insertFlows, getFlowSteps, insertFlowSteps, updateFlowStepsOptions, getFlowTexts, insertFlowTexts, getFlowStepTexts, insertFlowStepTexts } from "../queries/workflows.queries";
import { PoolClient } from "pg";
import { deepStrictEqual } from "assert";

const migrateWorkflows = async (
	applicationid: any,
	destApplicationid: any,
	formsIDMap: any,
	sourceClient: PoolClient,
	destClient: PoolClient
) => {
	try {
		const flowIDMap = await migrateFlowsTable(
			applicationid,
			destApplicationid,
			sourceClient,
			destClient
		);

		if (typeof flowIDMap !== "object") return flowIDMap;

		const flowStepIDMap = await migrateFlowStepsTable(
			applicationid,
			flowIDMap,
			formsIDMap,
			sourceClient,
			destClient
		);

		await migrateFlowTextsTable(
			applicationid,
			flowIDMap,
			sourceClient,
			destClient
		);

		await migrateFlowStepTextsTable(
			applicationid,
			flowStepIDMap,
			sourceClient,
			destClient
		);

		return [flowIDMap, flowStepIDMap];
	} catch (error) {
		return error;
	}
};

const migrateFlowsTable = async (
	applicationid: any,
	destApplicationid: any,
	sourceClient: PoolClient,
	destClient: PoolClient
) => {
	try {
		const flowIDMap: any = new Map();
		const flows = (await sourceClient.query(getFlows, [applicationid])).rows;
		// tslint:disable-next-line: prefer-for-of
		for (let i = 0; i < flows.length; i++) {
			flows[i].applicationid = destApplicationid;
		}
		const flowsJSON = JSON.stringify(flows, null, 2);
		const newFlowIDs = (await destClient.query(insertFlows, [flowsJSON])).rows;
		for (let i = 0; i < flows.length; i++) {
			flowIDMap[flows[i].id] = newFlowIDs[i].id;
		}
		return flowIDMap;
	} catch (error) {
		return error.stack;
	}
};

const migrateFlowStepsTable = async (
	applicationid: any,
	flowIDMap: any,
	formsIDmap: any,
	sourceClient: PoolClient,
	destClient: PoolClient
) => {
	try {
		const flowStepIDMap: any = new Map();
		const flowSteps = (await sourceClient.query(getFlowSteps, [applicationid]))
			.rows;
		// tslint:disable-next-line: prefer-for-of
		for (let i = 0; i < flowSteps.length; i++) {
			flowSteps[i].flow_id = flowIDMap[flowSteps[i].flow_id];
			if (flowSteps[i].form_id !== null) {
				flowSteps[i].form_id = formsIDmap[flowSteps[i].form_id];
			}
		}
		const flowStepsJSON = JSON.stringify(flowSteps, null, 2);
		const newFlowSteps = (
			await destClient.query(insertFlowSteps, [flowStepsJSON])
		).rows;
		for (let i = 0; i < flowSteps.length; i++) {
			flowStepIDMap[flowSteps[i].id] = newFlowSteps[i].id;
		}
		for (const flowStep of newFlowSteps) {
			if (flowStep.options.isDecisionPoint) {
				const values = [
					flowStepIDMap[
						flowStep.options.decisionPoint.actions[0].bounceToStep.stepId
					],
					flowStep.id,
				];
				const updateId = await destClient.query(updateFlowStepsOptions, values);
			}
		}

		return flowStepIDMap;
	} catch (error) {
		return error.stack;
	}
};

const migrateFlowTextsTable = async (
	applicationid: any,
	flowIDMap: any,
	sourceClient: PoolClient,
	destClient: PoolClient
) => {
	try {
		const flowTexts = (await sourceClient.query(getFlowTexts, [applicationid]))
			.rows;
		// tslint:disable-next-line: prefer-for-of
		for (let i = 0; i < flowTexts.length; i++) {
			flowTexts[i].flow_id = flowIDMap[flowTexts[i].flow_id];
		}
		const flowTextsJSON = JSON.stringify(flowTexts, null, 2);
		await destClient.query(insertFlowTexts, [flowTextsJSON]);
	} catch (error) {
		return error.stack;
	}
};

const migrateFlowStepTextsTable = async (
	applicationid: any,
	flowStepIDMap: any,
	sourceClient: PoolClient,
	destClient: PoolClient
) => {
	try {
		const flowStepTexts = (
			await sourceClient.query(getFlowStepTexts, [applicationid])
		).rows;
		// tslint:disable-next-line: prefer-for-of
		for (let i = 0; i < flowStepTexts.length; i++) {
			flowStepTexts[i].flow_step_id =
				flowStepIDMap[flowStepTexts[i].flow_step_id];
		}
		const flowStepTextsJSON = JSON.stringify(flowStepTexts, null, 2);
		await destClient.query(insertFlowStepTexts, [flowStepTextsJSON]);
	} catch (error) {
		return error.stack;
	}
};

export { migrateWorkflows };
