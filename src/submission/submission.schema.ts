export interface Submission {
  // 9e15까지 오차없이 잘 저장
  solutionId: number;
  name: string;
  problemId: number;
  result: string;
  memory: number;
  time: number;
  language: string;
  codeLength: number;
  // 날짜를 string형으로 전달하고 createMany에서 Date로 변환해서 저장하기 위함
  submittedAt: string;
}
