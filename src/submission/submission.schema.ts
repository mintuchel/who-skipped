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
  // timestamp 값인 밀리초값을 넘김
  submittedAt: number;
}
