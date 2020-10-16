import { getContents,
    insertContents,
    getContentTexts,
    insertContentTexts,} from "../queries/contents.queries";
    import { PoolClient } from "pg";

const migrateContents = async (
    applicationid: any,
    destApplicationId: any,
    sourceClient: PoolClient,
	destClient: PoolClient)=>{
    try{
        const contentsIDMap = await migrateContentsTable(
            applicationid,
            destApplicationId,
            sourceClient,
			destClient);

        if (typeof contentsIDMap !== "object") return contentsIDMap;

        const contentTextsIDMap = await migrateContentTextsTable(
            applicationid,
            contentsIDMap,
            sourceClient,
			destClient);

        return [contentsIDMap, contentTextsIDMap];
    }catch(err){
        return err;
    }
};

const migrateContentsTable = async (
    applicationid: any,
    destApplicationId: any,
    sourceClient: PoolClient,
	destClient: PoolClient) => {
    try {
        // Track old and new id for Contents table
        const contentsIDMap: any = new Map();

        // Querying for Contents table
        const resultsContents = await sourceClient.query(getContents, [applicationid]);

        // Initialize old id map to null
        // tslint:disable-next-line:prefer-for-of
        for(let i = 0; i < resultsContents.rows.length; i++){
            const oldId = resultsContents.rows[i].id;
            // @ts-ignore
            contentsIDMap[oldId] = null;
            resultsContents.rows[i].application_id = destApplicationId

        }

        // Insert rows of Contents table into destPool
        const newContentsIds = await destClient.query(insertContents, [JSON.stringify(resultsContents.rows),]);

        // Mapping old IDs to new IDs
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < resultsContents.rows.length; i++) {
            // @ts-ignore
            contentsIDMap[resultsContents.rows[i].id] = newContentsIds.rows[i].id;
        }

        return contentsIDMap;
    } catch (err) {
        return err.stack;
    }
};

const migrateContentTextsTable = async (
    applicationid: any,
    contentsIDMap: any,
    sourceClient: PoolClient,
	destClient: PoolClient) => {
    try {
        // Track old and new id for Content Texts table
        const ContentTextsIDMap: any = new Map();

        // Querying for Content Texts table
        const resultsContentTexts = await sourceClient.query(getContentTexts, [applicationid]);

        // Mapping the old contents_id to new IDs in contentsIDMap
        // tslint:disable-next-line:prefer-for-of
        for(let i = 0; i < resultsContentTexts.rows.length; i++) {
            // @ts-ignore
            resultsContentTexts.rows[i].content_id = contentsIDMap[resultsContentTexts.rows[i].content_id];
        }

        // Initialize old ID map to null
        // tslint:disable-next-line:prefer-for-of
        for(let i = 0; i < resultsContentTexts.rows.length; i++){
            const oldId = resultsContentTexts.rows[i].id;
            // @ts-ignore
            ContentTextsIDMap[oldId] = null;
        }

        // console.log(JSON.stringify(resultsContentTexts.rows))

       // Insert rows of Content Texts table into destPool
        const newContentTexts = await destClient.query(insertContentTexts, [JSON.stringify(resultsContentTexts.rows),]);

        // Mapping old IDs to new IDs
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < resultsContentTexts.rows.length; i++) {
            // @ts-ignore
            ContentTextsIDMap[resultsContentTexts.rows[i].id] = newContentTexts.rows[i].id;
        }

        return ContentTextsIDMap;
    } catch (err) {
        return err.stack;
    }
};

export{migrateContents};