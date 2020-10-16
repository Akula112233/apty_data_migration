const getForms = `
select * from assist.forms where application_id = $1
`;

const insertForms = `
INSERT INTO assist.forms (application_id, name, properties, is_deleted, created_date, created_by, updated_date, updated_by)
SELECT application_id, name, properties, is_deleted, created_date, created_by, updated_date, updated_by FROM json_populate_recordset(NULL::assist.forms,
  $1
)
RETURNING id
`

export {
    getForms,
    insertForms
}