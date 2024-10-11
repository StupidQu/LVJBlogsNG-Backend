/**
 * @readonly
 * @enum {number}
 */
const PRIV = {
    ADD_BLOG: 1 << 0,
    DELETE_SELF_BLOG: 1 << 1,
    EDIT_SELF_BLOG: 1 << 2,
    EDIT_BLOG: 1 << 3,
    DELETE_BLOG: 1 << 4,

    ADD_COMMENT: 1 << 5,
    DELETE_SELF_COMMENT: 1 << 6,
    EDIT_SELF_COMMENT: 1 << 7, // useless
    EDIT_COMMENT: 1 << 8, // useless
    DELETE_COMMENT: 1 << 9,

    USER_PROFILE: 1 << 10,
    EDIT_USER: 1 << 11,
};

export default PRIV;
