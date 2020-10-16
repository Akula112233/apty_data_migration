import {getForms, insertForms} from "../queries/forms.queries";
import { PoolClient } from "pg";

const migrateForms = async (applicationid: any, destApplicationid: any, sourceClient: PoolClient, destClient: PoolClient) => {
    try {
        const formsIdMap = await migrateFormsTable(applicationid, destApplicationid, sourceClient, destClient);

        if (typeof formsIdMap !== "object") return formsIdMap;
        return [formsIdMap];

    } catch (error) {
        return error;
    }
};

const migrateFormsTable = async (applicationid: any, destApplicationid: any, sourceClient: PoolClient, destClient: PoolClient) => {
    try {
        const formsIdMap: any = new Map(); // **Map for tracking the new and old Form IDs**

        // **Querying for the results of forms using the forms query and a specific app number**
        const resultsForms = await sourceClient.query(getForms, [applicationid]);

        // **Making a starting map of the old IDs for Forms and initializing to null**
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < resultsForms.rows.length; i++) {
            const oldId = resultsForms.rows[i].id
            // @ts-ignore
            formsIdMap[oldId] = null
            resultsForms.rows[i].application_id = destApplicationid;
        }

        // **Inserting elements queried above and returning the IDs for Forms**
        const newFormsIds = await destClient.query(insertForms, [JSON.stringify(resultsForms.rows)]);

        // **Finishing the map of validation IDs using the new IDs returned by the insert query above**
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < resultsForms.rows.length; i++) {
            // @ts-ignore
            formsIdMap[resultsForms.rows[i].id] = newFormsIds.rows[i].id
        }

        return formsIdMap;
    } catch (error) {
        return error.stack;
    }
};

export {migrateForms};
