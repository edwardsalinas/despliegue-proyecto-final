export const initialState = {
    status: "checking", //'authenticated', 'not-authenticated'
    user: {},
    errorMessage: undefined,
};

export const authenticatedState = {
    status: "authenticated", //'authenticated', 'not-authenticated'
    user: {
        uid: 'abc',
        name: 'Fernando'
    },
    errorMessage: undefined,
};

export const notAuthenticatedState = {
    status: "not-authenticated",
    user: {},
    errorMessage: undefined,
};