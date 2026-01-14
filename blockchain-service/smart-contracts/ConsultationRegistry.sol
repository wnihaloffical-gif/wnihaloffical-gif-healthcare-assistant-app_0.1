// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * AarogyaGuard Consultation Registry Smart Contract
 * Stores immutable records of medical consultations on blockchain
 */

contract ConsultationRegistry {
    // Struct for storing consultation records
    struct ConsultationRecord {
        bytes32 consultationHash;
        bytes32 resultHash;
        address patientAddress;
        uint256 timestamp;
        string metadataURI;
        bool verified;
    }

    // Mapping from consultation ID to record
    mapping(bytes32 => ConsultationRecord) public consultations;

    // Mapping from patient address to consultation IDs
    mapping(address => bytes32[]) public patientConsultations;

    // Total consultation counter
    uint256 public consultationCount;

    // Events
    event ConsultationRecorded(
        bytes32 indexed consultationId,
        bytes32 consultationHash,
        address indexed patient,
        uint256 timestamp
    );

    event RecordVerified(bytes32 indexed consultationId, bool verified);

    // Admin address
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    /**
     * Record a consultation on blockchain
     * Each consultationId is immutable once stored
     */
    function recordConsultation(
        bytes32 consultationId,
        bytes32 consultationHash,
        bytes32 resultHash,
        string memory metadataURI
    ) public {
        require(
            consultationHash != bytes32(0),
            "Consultation hash cannot be empty"
        );

        // Prevent overwriting existing records
        require(
            consultations[consultationId].timestamp == 0,
            "Consultation already exists"
        );

        ConsultationRecord memory record = ConsultationRecord({
            consultationHash: consultationHash,
            resultHash: resultHash,
            patientAddress: msg.sender,
            timestamp: block.timestamp,
            metadataURI: metadataURI,
            verified: true
        });

        consultations[consultationId] = record;
        patientConsultations[msg.sender].push(consultationId);
        consultationCount++;

        emit ConsultationRecorded(
            consultationId,
            consultationHash,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * Verify integrity of a consultation record
     */
    function verifyConsultation(
        bytes32 consultationId,
        bytes32 expectedHash
    ) public view returns (bool) {
        ConsultationRecord memory record = consultations[consultationId];
        return record.consultationHash == expectedHash && record.verified;
    }

    /**
     * Get all consultations for a patient
     */
    function getPatientConsultations(
        address patient
    ) public view returns (bytes32[] memory) {
        return patientConsultations[patient];
    }

    /**
     * Get consultation details
     */
    function getConsultationDetails(
        bytes32 consultationId
    ) public view returns (ConsultationRecord memory) {
        return consultations[consultationId];
    }

    /**
     * Get total number of consultations
     */
    function getConsultationCount() public view returns (uint256) {
        return consultationCount;
    }
}
