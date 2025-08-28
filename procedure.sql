/** 
    SHOW PROCEDURE STATUS WHERE Db = 'boj_tracker'

    source /Users/mintuchel/Desktop/boj-tracker/procedure.sql
**/

DROP PROCEDURE IF EXISTS updateUserSolvedProblemTagsProc;

DELIMITER //

CREATE PROCEDURE updateUserSolvedProblemTagsProc(IN username VARCHAR(20))
BEGIN
    UPDATE users
    SET solvedProblemTags = (
        SELECT JSON_OBJECTAGG(tag, count)
        FROM (
            SELECT problem_tags.tag AS tag, COUNT(*) AS count
            FROM problems
            JOIN problem_tags ON problems.id = problem_tags.problemId
            WHERE problems.id IN (
                SELECT problemId
                FROM submissions
                WHERE name = username COLLATE utf8mb4_0900_ai_ci
                AND result = 'ACCEPTED'
            )
            GROUP BY problem_tags.tag
        ) AS temp
    )
    WHERE name = username;
END //

DELIMITER ;