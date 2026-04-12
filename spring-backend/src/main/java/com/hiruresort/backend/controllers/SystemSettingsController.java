package com.hiruresort.backend.controllers;

import com.hiruresort.backend.models.SystemSettings;
import com.hiruresort.backend.repositories.SystemSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SystemSettingsController {

    @Autowired
    private SystemSettingsRepository settingsRepository;

    @GetMapping
    public SystemSettings getSettings() {
        return settingsRepository.getSettings();
    }

    @PutMapping
    public ResponseEntity<SystemSettings> updateSettings(@RequestBody SystemSettings settings) {
        SystemSettings existing = settingsRepository.getSettings();
        settings.setId(existing.getId());
        return ResponseEntity.ok(settingsRepository.save(settings));
    }
}
