package com.hiruresort.backend.repositories;

import com.hiruresort.backend.models.SystemSettings;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SystemSettingsRepository extends MongoRepository<SystemSettings, String> {
    default SystemSettings getSettings() {
        return findAll().stream().findFirst().orElse(new SystemSettings());
    }
}
