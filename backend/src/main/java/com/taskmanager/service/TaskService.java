package com.taskmanager.service;

import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.dto.CreateTaskRequest;
import com.taskmanager.model.dto.TaskDto;
import com.taskmanager.model.dto.UpdateTaskRequest;
import com.taskmanager.model.entity.Task;
import com.taskmanager.model.entity.User;
import com.taskmanager.model.enums.TaskPriority;
import com.taskmanager.model.enums.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public Page<TaskDto> getTasks(String status, String priority, Long assigneeId,
                                   Pageable pageable, User currentUser) {
        TaskStatus statusEnum = status != null ? TaskStatus.valueOf(status.toUpperCase()) : null;
        TaskPriority priorityEnum = priority != null ? TaskPriority.valueOf(priority.toUpperCase()) : null;

        Page<Task> tasks = taskRepository.findWithFilters(statusEnum, priorityEnum, assigneeId, pageable);
        return tasks.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public TaskDto getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return toDto(task);
    }

    @Transactional
    public TaskDto createTask(CreateTaskRequest request, User currentUser) {
        User assignee = request.getAssigneeId() != null
                ? userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"))
                : null;

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .status(TaskStatus.TODO)
                .dueDate(request.getDueDate())
                .owner(currentUser)
                .assignee(assignee)
                .build();

        Task saved = taskRepository.save(task);
        TaskDto dto = toDto(saved);

        messagingTemplate.convertAndSend("/topic/tasks", Map.of("type", "TASK_CREATED", "payload", dto));

        return dto;
    }

    @Transactional
    public TaskDto updateTask(Long id, UpdateTaskRequest request, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            task.setAssignee(assignee);
        }

        Task saved = taskRepository.save(task);
        TaskDto dto = toDto(saved);

        messagingTemplate.convertAndSend("/topic/tasks", Map.of("type", "TASK_UPDATED", "payload", dto));

        return dto;
    }

    @Transactional
    public TaskDto updateTaskStatus(Long id, TaskStatus status, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        task.setStatus(status);
        Task saved = taskRepository.save(task);
        TaskDto dto = toDto(saved);

        messagingTemplate.convertAndSend("/topic/tasks", Map.of("type", "TASK_STATUS_CHANGED", "payload", dto));

        return dto;
    }

    @Transactional
    public void deleteTask(Long id, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        taskRepository.delete(task);

        messagingTemplate.convertAndSend("/topic/tasks", Map.of("type", "TASK_DELETED", "payload", Map.of("id", id)));
    }

    private TaskDto toDto(Task task) {
        return TaskDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .ownerId(task.getOwner() != null ? task.getOwner().getId() : null)
                .ownerName(task.getOwner() != null ? task.getOwner().getName() : null)
                .assigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null)
                .assigneeName(task.getAssignee() != null ? task.getAssignee().getName() : null)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
