// 하위 폴더가 많을 경우 이렇게 barrel 파일로 묶어서 관리하는게 좋다

// Request DTO (Class)
// validation을 위한 class-validator, class-transformer를 사용하기 위해서 Class를 사용해야함
export { CreateGroupRequest } from "./request/create-group.dto";
export { UpdateGroupDescriptionRequest } from "./request/update-group-description.dto";
export { UpdateGroupManagerRequest } from "./request/update-group-manager.dto";
export { DeleteUsersFromGroupRequest } from "./request/delete-users-from-group.dto";
export { AddUsersToGroupRequest } from "./request/add-users-to-group.dto";

// Response DTO (Interface)
// TypeSafe를 위해 DTO 형식으로 Interface로 정의
export type { GroupSummaryResponse } from "./response/group-summary.dto";
export type { GroupInfoResponse } from "./response/group-info.dto";
