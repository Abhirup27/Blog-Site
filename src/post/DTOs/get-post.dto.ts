import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";
import { user } from "src/user/types/user.type";
import { post } from "../types/post.type";


export class GetPostParamsDto
{
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    postId?: post["postId"];

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    userId?: user["id"];

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    title?: post["title"];
}