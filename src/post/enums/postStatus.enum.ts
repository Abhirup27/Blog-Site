/**
 * enum which tells the current state of a post.
 * @enum {PostStatus}
 */
export enum PostStatus
{
    DRAFT = 'draft',
    SCHEDULED = 'scheduled',
    REVIEW = 'review',
    PUBLISHED = 'published',
}