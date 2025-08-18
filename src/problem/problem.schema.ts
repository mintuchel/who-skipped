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
@Schema({ versionKey: false })
export class Problem {
  // 이게 unique로 정의되어 있어 동일한 problemId에 해당하는 Problem 저장 시 dupulicate key error가 발생함
  @Prop({ required: true, unique: true })
  problemId: number;

  @Prop({ required: true })
  title: string;

  @Prop([String])
  tags: string[];
}

export const ProblemSchema = SchemaFactory.createForClass(Problem);

/**
 * @Schema({
  versionKey: false,
  timestamps: true,
  collection: 'problems',
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
    }
  }
})
 */
