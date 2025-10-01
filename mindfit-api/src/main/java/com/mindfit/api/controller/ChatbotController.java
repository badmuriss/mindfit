package com.mindfit.api.controller;

import com.mindfit.api.enums.Role;
import com.mindfit.api.common.exception.UnauthorizedException;
import com.mindfit.api.dto.ChatRequest;
import com.mindfit.api.dto.ChatResponse;
import com.mindfit.api.dto.RecommendationAction;
import com.mindfit.api.service.ChatbotService;
import com.mindfit.api.util.SecurityUtil;
import com.mindfit.api.service.RateLimitService;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/users/{userId}/chatbot")
@RequiredArgsConstructor
@Tag(name = "Chatbot", description = "Chatbot API")
@SecurityRequirement(name = "bearerAuth")
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final RateLimitService rateLimitService;

    @PostMapping
    @Operation(summary = "Chat with AI assistant")
    public ChatResponse chat(
            @PathVariable String userId,
            @Valid @RequestBody ChatRequest request) {

        if (!SecurityUtil.isAdmin() && !userId.equals(SecurityUtil.getCurrentUserId())) {
            throw new UnauthorizedException("Users can only access their own chatbot");
        }

        Bucket bucket = rateLimitService.createBucketForUser(userId);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        
        if (!probe.isConsumed()) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS, 
                    "Rate limit exceeded. Try again in " + probe.getNanosToWaitForRefill() / 1_000_000_000 + " seconds"
            );
        }
        return chatbotService.chat(userId, request);
    }

    @DeleteMapping("/history")
    @Operation(summary = "Clear user's chatbot history")
    public void clearHistory(@PathVariable String userId) {
        if (!SecurityUtil.isAdmin() && !userId.equals(SecurityUtil.getCurrentUserId())) {
            throw new UnauthorizedException("Users can only clear their own chatbot history");
        }
        chatbotService.clearHistory(userId);
    }

    @PostMapping("/actions/execute")
    @Operation(summary = "Execute a recommendation action (add workout or meal)")
    public void executeAction(
            @PathVariable String userId,
            @Valid @RequestBody RecommendationAction action) {

        if (!SecurityUtil.isAdmin() && !userId.equals(SecurityUtil.getCurrentUserId())) {
            throw new UnauthorizedException("Users can only execute their own actions");
        }

        Bucket bucket = rateLimitService.createBucketForUser(userId);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (!probe.isConsumed()) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Rate limit exceeded. Try again in " + probe.getNanosToWaitForRefill() / 1_000_000_000 + " seconds"
            );
        }

        chatbotService.executeRecommendationAction(userId, action);
    }
}
