const getContents = `
SELECT cont.*
FROM assist.contents cont
WHERE cont.application_id = $1 and cont.is_deleted = 'false'
`;

const insertContents = `
INSERT INTO assist.contents (application_id, type, properties, keywords, external_unique_id, is_deleted, created_date, created_by, updated_date, updated_by)
SELECT application_id, type, properties, keywords, external_unique_id, is_deleted, created_date, created_by, updated_date, updated_by
FROM json_populate_recordset(NULL:: assist.contents, $1)
RETURNING id
`;
const getContentTexts = `
SELECT context.*
FROM assist.content_texts context
    JOIN assist.contents cont
        ON context.content_id = cont.id
WHERE context.is_deleted = 'false' and cont.application_id = $1
`;

const insertContentTexts = `
INSERT INTO assist.content_texts (content_id, locale_id, message, is_deleted, created_date, created_by, updated_date, updated_by, content)
SELECT content_id, locale_id, message, is_deleted, created_date, created_by, updated_date, updated_by, content
FROM json_populate_recordset(NULL:: assist.content_texts, $1)
RETURNING id
`;

export{
    getContents,
    insertContents,
    getContentTexts,
    insertContentTexts
}