import express from "express";
import { migrateWorkflows } from "../migrations/workflows.migrations";
import { migrateBadges } from "../migrations/badges.migrations";
import { migrateValidations } from "../migrations/validations.migrations";
import { migrateForms } from "../migrations/forms.migrations";
import {migrateContents} from "../migrations/contents.migrations";
import {migrateOnboardingGroups} from "../migrations/onboardingGroups.migrations";
import { initiatePools } from "../db";
const migrationRouter = express.Router();

const migrateAllHandler = async (req: any, res: any) => {
	const {
		applicationid,
		destApplicationid,
		sourceConnectionString,
		destConnectionString,
	} = req.body;

	const { pool, destPool } = initiatePools(
		sourceConnectionString,
		destConnectionString
	);

	const sourceClient = await pool.connect();
	const destClient = await destPool.connect();

	try {
		const migrateFormsResponse = await migrateForms(
			applicationid,
			destApplicationid,
			sourceClient,
			destClient
		);
		if (typeof migrateFormsResponse !== "object") {
			console.log(
				`FAILED: Forms Migration Error for Application ID: ${applicationid}...`
			);
			return res.status(400).json(migrateFormsResponse);
		}
		console.log(
			`SUCCESS: Forms Migration Completed for Application ID: ${applicationid}...`
		);
		/////////////////////////////////////////////////////////////////////////////////
		const migrateFlowsResponse = await migrateWorkflows(
			applicationid,
			destApplicationid,
			migrateFormsResponse[0],
			sourceClient,
			destClient
		);
		if (typeof migrateFlowsResponse !== "object") {
			console.log(
				`FAILED: Flows Migration Error for Application ID: ${applicationid}...`
			);
			return res.status(400).json(migrateFlowsResponse);
		}
		console.log(
			`SUCCESS: Flows Migration Completed for Application ID: ${applicationid}...`
		);

		//////////////////////////////////////////////////////////////////////////////////

		const migrateBadgesResponse = await migrateBadges(
			applicationid,
			migrateFormsResponse[0],
			sourceClient,
			destClient
		);
		if (typeof migrateBadgesResponse !== "object") {
			console.log(
				`FAILED: Announcements Migration Error for Application ID: ${applicationid}...`
			);
			return res.status(400).json(migrateBadgesResponse);
		}
		console.log(
			`SUCCESS: Announcements Migration Completed for Application ID: ${applicationid}...`
		);
		//////////////////////////////////////////////////////////////////////////////////
		const migrateValidationsResponse = await migrateValidations(
			applicationid,
			migrateFormsResponse[0],
			sourceClient,
			destClient
		);
		if (typeof migrateValidationsResponse !== "object") {
			console.log(
				`FAILED: Validation Migration Error for Application ID: ${applicationid}...`
			);
			return res.status(400).json(migrateValidationsResponse);
		}
		console.log(
			`SUCCESS: Validation Migration Completed for Application ID: ${applicationid}...`
		);
		//////////////////////////////////////////////////////////////////////////////////
		const migrateContentsResponse = await migrateContents(
			applicationid,
			destApplicationid,
			sourceClient,
			destClient);
		if(typeof migrateContentsResponse !== "object"){
			console.log(
				`FAILED: Contents Migration Error for Application ID: ${applicationid}...`
			);
			return res.status(400).json(migrateContentsResponse);
		}
		console.log(
			`SUCCESS: Contents Migration Completed for Application ID: ${applicationid}...`
		);
		//////////////////////////////////////////////////////////////////////////////////
		const migrateOnboardingGroupsResponse = await migrateOnboardingGroups(
			applicationid,
			destApplicationid,
			migrateContentsResponse[0],
			migrateFlowsResponse[0],
			sourceClient,
			destClient);
		if(typeof migrateOnboardingGroupsResponse !== "object"){
			console.log(
				`FAILED: OnboardingGroups Migration Error for Application ID: ${applicationid}...`
			);
			return res.status(400).json(migrateOnboardingGroupsResponse);
		}
		console.log(
			`SUCCESS: OnboardingGroups Migration Completed for Application ID: ${applicationid}...`
		);
		//////////////////////////////////////////////////////////////////////////////////

		res.status(200).json({
			formsIDMap: migrateFormsResponse[0],
			flowIDMap: migrateFlowsResponse[0],
			flowStepIDMap: migrateFlowsResponse[1],
			badgesIDMap: migrateBadgesResponse[0],
			announcementsMessagesIDMap: migrateBadgesResponse[1],
			validationIDMap: migrateValidationsResponse[0],
			validatorIDMap: migrateValidationsResponse[1],
			validatorMessagesIDMap: migrateValidationsResponse[2],
		    contentsIDMap: migrateContentsResponse[0],
			contentTextsIDMap: migrateContentsResponse[1],
			onboardingGroupsIDMap: migrateOnboardingGroupsResponse[0],
			onboardingGroupTextsIDMap: migrateOnboardingGroupsResponse[1],
			onboardingGroupListsIDMap: migrateOnboardingGroupsResponse[2],
		});
	} catch (err) {
		console.log(
			`FAILED: Migration Error for Application ID: ${applicationid}...`
		);
		res.status(400).send(err);
	}
};

migrationRouter.post("/all", migrateAllHandler);

export { migrationRouter };

/*
const migrateWorkflowsHandler = async (req: any, res: any) => {
	const applicationid = req.params.applicationid;
	try {
		const migrateResponse = await migrateWorkflows(applicationid);
		if (typeof migrateResponse !== "object") {
			// tslint:disable-next-line: no-console
			console.log(
				`FAILED: Migration Error for Application ID: ${applicationid}...`
			);
			return res.status(400).json(migrateResponse);
		}
		// tslint:disable-next-line: no-console
		console.log(
			`SUCCESS: Migration Completed for Application ID: ${applicationid}...`
		);
		res.status(200).json({
			flowIDMap: migrateResponse[0],
			flowStepIDMap: migrateResponse[1],
		});
	} catch (err) {
		// tslint:disable-next-line: no-console
		console.log(
			`FAILED: Announcements Migration Error for Application ID: ${applicationid}...`
		);
		res.status(400).send(err);
	}
};

// test



const migrateValidationsHandler = async (req: any, res: any) => {
	const applicationid = req.params.applicationid;
	try {
		const migrateResponse = await migrateValidations(applicationid);
		if (typeof migrateResponse !== "object") {
			// tslint:disable-next-line: no-console
			console.log(
				`FAILED: Validation Migration Error for Application ID: ${applicationid}...`
			);
			return res.status(400).json(migrateResponse);
		}
		// tslint:disable-next-line: no-console
		console.log(
			`SUCCESS: Validation Migration Completed for Application ID: ${applicationid}...`
		);
		res.status(200).json({
			validationIDMap: migrateResponse[0],
			validatorIDMap: migrateResponse[1],
		});
	} catch (err) {
		// tslint:disable-next-line: no-console
		console.log(
			`FAILED: Validation Migration Error for Application ID: ${applicationid}...`
		);
		res.status(400).send(err);
	}
};

const migrateFormsHandler = async (req: any, res: any) => {
	const applicationid = req.params.applicationid;
	try {
		const migrateResponse = await migrateForms(applicationid);
		if (typeof migrateResponse !== "object") {
			// tslint:disable-next-line: no-console
			console.log(
				`FAILED: Forms Migration Error for Application ID: ${applicationid}...`
			);
			return res.status(400).json(migrateResponse);
		}
		// tslint:disable-next-line: no-console
		console.log(
			`SUCCESS: Forms Migration Completed for Application ID: ${applicationid}...`
		);
		res.status(200).json({
			formsIdMap: migrateResponse[0],
		});
	} catch (err) {
		// tslint:disable-next-line: no-console
		console.log(
			`FAILED: Forms Migration Error for Application ID: ${applicationid}...`
		);
		res.status(400).send(err);
	}
};

const migrateContentsHandler = async (req: any, res: any) => {
	const applicationid = req.params.applicationid;
	try {
		const migrateResponse = await migrateContents(applicationid, sourceClient,
			destClient);
		if (typeof migrateResponse !== "object") {
			// tslint:disable-next-line: no-console
			console.log(
				`FAILED: Migration Error for Application ID: ${applicationid}...`
			);
			return res.status(400).json(migrateResponse);
		}
		// tslint:disable-next-line: no-console
		console.log(
			`SUCCESS: Migration Completed for Application ID: ${applicationid}...`
		);
		res.status(200).json({
			contentsIDMap: migrateResponse[0],
			contentTextsIDMap: migrateResponse[1],
		});
	} catch (err) {
		// tslint:disable-next-line: no-console
		console.log(
			`FAILED: Contents Migration Error for Application ID: ${applicationid}...`
		);
		res.status(400).send(err);
	}
};



migrationRouter.get("/workflows/:applicationid", migrateWorkflowsHandler);
migrationRouter.get("/validations/:applicationid", migrateValidationsHandler);
migrationRouter.get("/badges/:applicationid", migrateBadgesHandler);
migrationRouter.get("/forms/:applicationid", migrateFormsHandler);
migrationRouter.get("/contents/:applicationid", migrateContentsHandler);*/
