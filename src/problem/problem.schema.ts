import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

/**
 * MongoDB에 존재하는 원시 컬렉션 데이터인 JSON-like 데이터를
 * 받아서 HydratedDocument 래퍼 클래스로 감싸준 객체
 * 데이터에 CRUD 작업을 할 수 있는 Mongoose 함수들을 추가해준 것이 HydratedDocument 객체이다.
 */
export type ProblemDocument = HydratedDocument<Problem>;

/**
 * MongoDB(DocumentDB)는 NoSQL로 RDBMS처럼 DB 내 정해진 스키마가 없지만
 * 코드 단에서 스키마 틀을 정의함으로써 해당 형식대로 저장되도록 할 수 있다.
 */
@Schema()
export class Problem {
  @Prop({ required: true, unique: true })
  problemId: string;

  @Prop({ required: true })
  title: string;

  @Prop([String])
  tags: string[];
}

export const ProblemSchema = SchemaFactory.createForClass(Problem);
