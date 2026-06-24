package com.taskmanager.repository;

import com.taskmanager.model.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("""
        SELECT t FROM Task t
        WHERE (:status IS NULL OR t.status = :status)
        AND (:priority IS NULL OR t.priority = :priority)
        AND (:assigneeId IS NULL OR t.assignee.id = :assigneeId)
        """)
    Page<Task> findWithFilters(
            @Param("status") com.taskmanager.model.enums.TaskStatus status,
            @Param("priority") com.taskmanager.model.enums.TaskPriority priority,
            @Param("assigneeId") Long assigneeId,
            Pageable pageable);

    @Query("""
        SELECT t FROM Task t
        WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :term, '%'))
        OR LOWER(t.description) LIKE LOWER(CONCAT('%', :term, '%'))
        """)
    Page<Task> search(@Param("term") String term, Pageable pageable);
}
