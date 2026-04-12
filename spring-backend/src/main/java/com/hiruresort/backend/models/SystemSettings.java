package com.hiruresort.backend.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "system_settings")
public class SystemSettings {
    @Id
    private String id;
    
    private boolean allowFrontOfficeToViewOccupancy = true;
    private boolean allowFrontOfficeToViewCCPayments = false;
    private boolean maintenanceMode = false;
    private String onlineExcelUrl;
}
