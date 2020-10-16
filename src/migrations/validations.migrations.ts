import {
	getFlows,
	insertFlows,
	getFlowSteps,
	insertFlowSteps,
	getFlowTexts,
	insertFlowTexts,
	getFlowStepTexts,
	insertFlowStepTexts,
} from "../queries/workflows.queries";
import {
	getValidations,
	insertValidations,
	getValidators,
	insertValidators,
	getValidatorMessages,
	insertValidatorMessages,
} from "../queries/validations.queries";
import { PoolClient } from "pg";

const migrateValidations = async (
	applicationid: any,
	formsIDMap: any,
	sourceClient: PoolClient,
	destClient: PoolClient
) => {
	try {
		const validationsIDMap = await migrateValidationsTable(
			applicationid,
			formsIDMap,
			sourceClient,
			destClient
		);

		if (typeof validationsIDMap !== "object") return validationsIDMap;

		const validatorsIDMap = await migrateValidatorsTable(
			applicationid,
			validationsIDMap,
			sourceClient,
			destClient
		);

		const validatorMessagesIDMap = await migrateValidatorsMessagesTable(
			applicationid,
			validatorsIDMap,
			sourceClient,
			destClient
		);

		return [validationsIDMap, validatorsIDMap, validatorMessagesIDMap];
	} catch (error) {
		return error;
	}
};

const migrateValidationsTable = async (
	applicationid: any,
	formsIDMap: any,
	sourceClient: PoolClient,
	destClient: PoolClient
) => {
	try {
		const validationsIDMap: any = new Map(); // **Map for tracking the new and old Validation IDs**

		// **Querying for the results of validations using the validations query and a specific app number**
		const resultsValidations = await sourceClient.query(getValidations, [
			applicationid,
		]);

		// **Making a starting map of the old IDs for Validations and initializing to null**
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < resultsValidations.rows.length; i++) {
			const oldId = resultsValidations.rows[i].id;
			// @ts-ignore
			validationsIDMap[oldId] = null;
			resultsValidations.rows[i].form_id =
				formsIDMap[resultsValidations.rows[i].form_id];
		}

		// **Inserting elements queried above and returning the IDs for Validations**
		const newValidationIds = await destClient.query(insertValidations, [
			JSON.stringify(resultsValidations.rows),
		]);

		// **Finishing the map of validation IDs using the new IDs returned by the insert query above**
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < resultsValidations.rows.length; i++) {
			// @ts-ignore
			validationsIDMap[resultsValidations.rows[i].id] =
				newValidationIds.rows[i].id;
		}

		return validationsIDMap;
	} catch (error) {
		return error.stack;
	}
};

const migrateValidatorsTable = async (
	applicationid: any,
	mapOfValidationIds: any,
	sourceClient: PoolClient,
	destClient: PoolClient
) => {
	try {
		const mapOfValidatorIds = {}; // **Map for tracking new and old Validator IDs**

		// **Querying for the results of validators using the validators query and a specific app number**
		const resultsValidators = await sourceClient.query(getValidators, [
			applicationid,
		]);

		// **Mapping the old validation_id to the new ones using mapOfValidationIds made earlier**
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < resultsValidators.rows.length; i++) {
			// @ts-ignore
			resultsValidators.rows[i].validation_id =
				mapOfValidationIds[resultsValidators.rows[i].validation_id];
		}

		// **Making a starting map of the old IDs for validators and initializing to null**
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < resultsValidators.rows.length; i++) {
			const oldId = resultsValidators.rows[i].id;
			// @ts-ignore
			mapOfValidatorIds[oldId] = null;
		}

		// **Inserting elements queried above and returning the IDs for Validators**
		const newValidatorIds = await destClient.query(insertValidators, [
			JSON.stringify(resultsValidators.rows),
		]);

		// **Finishing the map of Validator IDs using the new IDs returned by the insert query above**
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < resultsValidators.rows.length; i++) {
			// @ts-ignore
			mapOfValidatorIds[resultsValidators.rows[i].id] =
				newValidatorIds.rows[i].id;
		}
		return mapOfValidatorIds;
	} catch (error) {
		return error.stack;
	}
};

const migrateValidatorsMessagesTable = async (
	applicationid: any,
	mapOfValidatorIds: any,
	sourceClient: PoolClient,
	destClient: PoolClient
) => {
	try {
		const mapOfValidatorMessageIds = {}; // **Map for tracking new and old ValidationMessage IDs**

		// **Querying for the results of validators using the validators query and a specific app number**
		const resultsValidatorMessages = await sourceClient.query(
			getValidatorMessages,
			[applicationid]
		);

		// **Mapping the old validation_id to the new ones using mapOfValidationIds made earlier**
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < resultsValidatorMessages.rows.length; i++) {
			// @ts-ignore
			mapOfValidatorMessageIds[resultsValidatorMessages.rows[i].id] = null
			// @ts-ignore
			resultsValidatorMessages.rows[i].validator_id =
				mapOfValidatorIds[resultsValidatorMessages.rows[i].validator_id];
		}
		// console.log(JSON.stringify(resultsValidations.rows))

		// **Inserting elements queried above and returning the IDs for Validators**
		const newValidatorMessageIds = await destClient.query(
			insertValidatorMessages,
			[JSON.stringify(resultsValidatorMessages.rows)]
		);

		// **Finishing the map of ValidatorMessage IDs using the new IDs returned by the insert query above**
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < resultsValidatorMessages.rows.length; i++) {
			// @ts-ignore
			mapOfValidatorMessageIds[resultsValidatorMessages.rows[i].id] = newValidatorMessageIds.rows[i].id;
		}

		return mapOfValidatorMessageIds;
	} catch (error) {
		return error.stack;
	}
};

export { migrateValidations };
