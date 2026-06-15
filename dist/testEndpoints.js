"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BASE_URL = 'http://localhost:5000/api';
async function runTests() {
    console.log('=== Starting Backend Endpoints Integration Tests ===\n');
    let token = '';
    let testVesselId = '';
    let testTeamMemberId = '';
    let testEquipmentId = '';
    let testMessageId = '';
    // Helper for printing test status
    const assertTest = (name, condition, details) => {
        if (condition) {
            console.log(`[PASS] ${name}`);
        }
        else {
            console.log(`[FAIL] ${name}`);
            if (details)
                console.log('Details:', details);
        }
    };
    try {
        // 1. Health Check
        const healthRes = await fetch(`${BASE_URL}/health`);
        const healthData = (await healthRes.json());
        assertTest('GET /health', healthRes.status === 200 && healthData.status === 'healthy');
        // 2. Admin Login
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin1234' })
        });
        const loginData = (await loginRes.json());
        token = loginData.token;
        assertTest('POST /auth/login', loginRes.status === 200 && !!token);
        // 3. Admin Me (Protected)
        const meRes = await fetch(`${BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const meData = (await meRes.json());
        assertTest('GET /auth/me', meRes.status === 200 && meData.username === 'admin');
        // 4. Vessels - Get All
        const vesselsGetRes = await fetch(`${BASE_URL}/vessels`);
        const vesselsGetData = (await vesselsGetRes.json());
        assertTest('GET /vessels (Get All)', vesselsGetRes.status === 200 && Array.isArray(vesselsGetData));
        // 5. Vessels - Create (Protected, Multipart form-data simulation)
        const vesselFormData = new FormData();
        vesselFormData.append('name', 'KT TEST RUNNER');
        vesselFormData.append('type', 'Test Utility Boat');
        vesselFormData.append('lengthOverall', '25.00 m');
        vesselFormData.append('breadth', '6.00 m');
        vesselFormData.append('draft', '1.50 m');
        vesselFormData.append('mainEngines', '1 x Test Engine');
        vesselFormData.append('bhp', '1,000 BHP');
        vesselFormData.append('bollardPull', '10 Metric Tons');
        vesselFormData.append('deckSpace', '50 m²');
        vesselFormData.append('flag', 'Nigerian');
        vesselFormData.append('fuelOil', '10 m³');
        vesselFormData.append('freshWater', '5 m³');
        vesselFormData.append('deckCargo', '15 Metric Tons');
        vesselFormData.append('safetyCertifications', JSON.stringify(['Test Certification A']));
        vesselFormData.append('status', 'Available');
        const vesselCreateRes = await fetch(`${BASE_URL}/vessels`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: vesselFormData
        });
        const vesselCreateData = (await vesselCreateRes.json());
        testVesselId = vesselCreateData.id;
        assertTest('POST /vessels (Create)', vesselCreateRes.status === 201 && !!testVesselId, vesselCreateData);
        // 6. Vessels - Get One
        const vesselGetOneRes = await fetch(`${BASE_URL}/vessels/${testVesselId}`);
        const vesselGetOneData = (await vesselGetOneRes.json());
        assertTest('GET /vessels/:id', vesselGetOneRes.status === 200 && vesselGetOneData.name === 'KT TEST RUNNER');
        // 7. Vessels - Update (Protected, Multipart form-data simulation)
        const vesselUpdateFormData = new FormData();
        vesselUpdateFormData.append('status', 'On Charter');
        const vesselUpdateRes = await fetch(`${BASE_URL}/vessels/${testVesselId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: vesselUpdateFormData
        });
        const vesselUpdateData = (await vesselUpdateRes.json());
        assertTest('PUT /vessels/:id (Update)', vesselUpdateRes.status === 200 && vesselUpdateData.status === 'On Charter');
        // 8. Vessels - Delete (Protected)
        const vesselDeleteRes = await fetch(`${BASE_URL}/vessels/${testVesselId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        assertTest('DELETE /vessels/:id', vesselDeleteRes.status === 200);
        // 9. Team - Get All
        const teamGetRes = await fetch(`${BASE_URL}/team`);
        const teamGetData = (await teamGetRes.json());
        assertTest('GET /team (Get All)', teamGetRes.status === 200 && Array.isArray(teamGetData));
        // 10. Team - Create (Protected, Multipart simulation)
        const teamFormData = new FormData();
        teamFormData.append('name', 'John Test');
        teamFormData.append('role', 'Test Engineer');
        teamFormData.append('category', 'management');
        teamFormData.append('bio', 'Bio of John Test');
        teamFormData.append('experience', '5 years');
        teamFormData.append('responsibilities', JSON.stringify(['Testing systems']));
        const teamCreateRes = await fetch(`${BASE_URL}/team`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: teamFormData
        });
        const teamCreateData = (await teamCreateRes.json());
        testTeamMemberId = teamCreateData.id;
        assertTest('POST /team (Create)', teamCreateRes.status === 201 && !!testTeamMemberId, teamCreateData);
        // 11. Team - Update (Protected)
        const teamUpdateFormData = new FormData();
        teamUpdateFormData.append('experience', '6 years');
        const teamUpdateRes = await fetch(`${BASE_URL}/team/${testTeamMemberId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: teamUpdateFormData
        });
        const teamUpdateData = (await teamUpdateRes.json());
        assertTest('PUT /team/:id (Update)', teamUpdateRes.status === 200 && teamUpdateData.experience === '6 years');
        // 12. Team - Delete (Protected)
        const teamDeleteRes = await fetch(`${BASE_URL}/team/${testTeamMemberId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        assertTest('DELETE /team/:id', teamDeleteRes.status === 200);
        // 13. Equipment - Get All
        const equipGetRes = await fetch(`${BASE_URL}/equipment`);
        const equipGetData = (await equipGetRes.json());
        assertTest('GET /equipment (Get All)', equipGetRes.status === 200 && Array.isArray(equipGetData));
        // 14. Equipment - Create (Protected, Multipart simulation)
        const equipFormData = new FormData();
        equipFormData.append('name', 'Test Fender');
        equipFormData.append('type', 'Fenders');
        equipFormData.append('specs', 'Test specs');
        equipFormData.append('quantity', '10');
        equipFormData.append('status', 'Available');
        equipFormData.append('description', 'Test description');
        const equipCreateRes = await fetch(`${BASE_URL}/equipment`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: equipFormData
        });
        const equipCreateData = (await equipCreateRes.json());
        testEquipmentId = equipCreateData.id;
        assertTest('POST /equipment (Create)', equipCreateRes.status === 201 && !!testEquipmentId, equipCreateData);
        // 15. Equipment - Update (Protected)
        const equipUpdateFormData = new FormData();
        equipUpdateFormData.append('status', 'Leased');
        const equipUpdateRes = await fetch(`${BASE_URL}/equipment/${testEquipmentId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: equipUpdateFormData
        });
        const equipUpdateData = (await equipUpdateRes.json());
        assertTest('PUT /equipment/:id (Update)', equipUpdateRes.status === 200 && equipUpdateData.status === 'Leased');
        // 16. Equipment - Delete (Protected)
        const equipDeleteRes = await fetch(`${BASE_URL}/equipment/${testEquipmentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        assertTest('DELETE /equipment/:id', equipDeleteRes.status === 200);
        // 17. Message - Public Submit
        const messageRes = await fetch(`${BASE_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Alice Tester',
                email: 'alice@test.com',
                phone: '12345678',
                company: 'Test Company',
                serviceNeeded: 'Vessel Chartering',
                message: 'This is a test submission.',
                messageType: 'Contact'
            })
        });
        const messageData = (await messageRes.json());
        testMessageId = messageData.id;
        assertTest('POST /messages (Public Submit)', messageRes.status === 201 && !!testMessageId);
        // 18. Message - Get All (Protected)
        const messageGetRes = await fetch(`${BASE_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const messageGetData = (await messageGetRes.json());
        assertTest('GET /messages (Inbox logs)', messageGetRes.status === 200 && Array.isArray(messageGetData));
        // 19. Message - Update Status (Protected)
        const messageStatusRes = await fetch(`${BASE_URL}/messages/${testMessageId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'Read' })
        });
        const messageStatusData = (await messageStatusRes.json());
        assertTest('PATCH /messages/:id/status', messageStatusRes.status === 200 && messageStatusData.status === 'Read');
        // 20. Message - Delete (Protected)
        const messageDeleteRes = await fetch(`${BASE_URL}/messages/${testMessageId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        assertTest('DELETE /messages/:id', messageDeleteRes.status === 200);
    }
    catch (error) {
        console.error('Test run failed with error:', error);
    }
    console.log('\n=== All Tests Executed ===');
}
runTests();
