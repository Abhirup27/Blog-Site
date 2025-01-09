import { user } from "src/user/types/user.type"


export type post = {
    userId?: user["id"],
    postId: number,
    title: string,
   content: string,
}