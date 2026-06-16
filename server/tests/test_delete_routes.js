// test_delete_routes.js
// Tests for delete API routes - creates resources then deletes them

const API = "http://localhost:3000/api";
const DELETE_API = "http://localhost:3000/api/delete";

// Store created resource IDs for cleanup
let createdIds = {
    users: [],
    projects: [],
    branches: [],
    commits: [],
    pullRequests: [],
    reviews: [],
    aiActions: []
};

// Helper function to make API calls
async function apiCall(url, method = "GET", body = null) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const res = await fetch(url, options);
    return await res.json();
}

// ============= USER TESTS =============
async function testUserDelete() {
    console.log("\n=== Testing User Delete ===");
    
    // Create a user
    console.log("Creating user...");
    const user = await apiCall(`${API}/auth/register`, "POST", {
        name: `test_user_${Date.now()}`,
        type: "human",
        password: "testpass123"
    });
    console.log("Created user:", user);
    createdIds.users.push(user.id);
    
    // Delete the user
    console.log("Deleting user...");
    const deleteResult = await apiCall(`${DELETE_API}/users/${user.id}`, "DELETE");
    console.log("Delete result:", deleteResult);
    
    console.log("✅ User delete test completed");
}

// ============= PROJECT TESTS =============
async function testProjectDelete() {
    console.log("\n=== Testing Project Delete ===");
    
    // Create a user first (needed for project)
    const user = await apiCall(`${API}/auth/users`, "POST", {
        name: `project_owner_${Date.now()}`,
        type: "human",
        password: "testpass123"
    });
    createdIds.users.push(user.id);
    
    // Create a project
    console.log("Creating project...");
    const project = await apiCall(`${API}/projects`, "POST", {
        name: `Test Project ${Date.now()}`,
        description: "Test project for deletion",
        createdBy: user.id
    });
    console.log("Created project:", project);
    createdIds.projects.push(project.id);
    
    // Delete the project
    console.log("Deleting project...");
    const deleteResult = await apiCall(`${DELETE_API}/projects/${project.id}`, "DELETE");
    console.log("Delete result:", deleteResult);
    
    // Cleanup user
    await apiCall(`${DELETE_API}/users/${user.id}`, "DELETE");
    
    console.log("✅ Project delete test completed");
}

// ============= BRANCH TESTS =============
async function testBranchDelete() {
    console.log("\n=== Testing Branch Delete ===");
    
    // Create user and project
    const user = await apiCall(`${API}/auth/users`, "POST", {
        name: `branch_owner_${Date.now()}`,
        type: "human",
        password: "testpass123"
    });
    createdIds.users.push(user.id);
    
    const project = await apiCall(`${API}/projects`, "POST", {
        name: `Branch Test Project ${Date.now()}`,
        description: "Test project for branch deletion",
        createdBy: user.id
    });
    createdIds.projects.push(project.id);
    
    // Create a branch
    console.log("Creating branch...");
    const branch = await apiCall(`${API}/branches`, "POST", {
        projectId: project.id,
        name: `test-branch-${Date.now()}`,
        headCommitId: null,
        createdBy: user.id
    });
    console.log("Created branch:", branch);
    createdIds.branches.push(branch.id);
    
    // Delete the branch
    console.log("Deleting branch...");
    const deleteResult = await apiCall(`${DELETE_API}/branches/${branch.id}`, "DELETE");
    console.log("Delete result:", deleteResult);
    
    // Cleanup
    await apiCall(`${DELETE_API}/projects/${project.id}`, "DELETE");
    await apiCall(`${DELETE_API}/users/${user.id}`, "DELETE");
    
    console.log("✅ Branch delete test completed");
}

// ============= COMMIT TESTS =============
async function testCommitDelete() {
    console.log("\n=== Testing Commit Delete ===");
    
    // Create user and project
    const user = await apiCall(`${API}/auth/users`, "POST", {
        name: `commit_author_${Date.now()}`,
        type: "human",
        password: "testpass123"
    });
    createdIds.users.push(user.id);
    
    const project = await apiCall(`${API}/projects`, "POST", {
        name: `Commit Test Project ${Date.now()}`,
        description: "Test project for commit deletion",
        createdBy: user.id
    });
    createdIds.projects.push(project.id);
    
    const branch = await apiCall(`${API}/branches`, "POST", {
        projectId: project.id,
        name: `main-${Date.now()}`,
        headCommitId: null,
        createdBy: user.id
    });
    createdIds.branches.push(branch.id);
    
    // Create a commit
    console.log("Creating commit...");
    const commit = await apiCall(`${API}/commits`, "POST", {
        projectId: project.id,
        branchId: branch.id,
        authorId: user.id,
        title: "Test commit",
        content: "This is a test commit for deletion"
    });
    console.log("Created commit:", commit);
    createdIds.commits.push(commit.id);
    
    // Delete the commit
    console.log("Deleting commit...");
    const deleteResult = await apiCall(`${DELETE_API}/commits/${commit.id}`, "DELETE");
    console.log("Delete result:", deleteResult);
    
    // Cleanup
    await apiCall(`${DELETE_API}/branches/${branch.id}`, "DELETE");
    await apiCall(`${DELETE_API}/projects/${project.id}`, "DELETE");
    await apiCall(`${DELETE_API}/users/${user.id}`, "DELETE");
    
    console.log("✅ Commit delete test completed");
}

// ============= BULK DELETE TESTS =============
async function testBulkProjectDelete() {
    console.log("\n=== Testing Bulk Project Delete ===");
    
    // Create user
    const user = await apiCall(`${API}/auth/users`, "POST", {
        name: `bulk_test_user_${Date.now()}`,
        type: "human",
        password: "testpass123"
    });
    createdIds.users.push(user.id);
    
    // Create multiple projects
    console.log("Creating multiple projects...");
    const project1 = await apiCall(`${API}/projects`, "POST", {
        name: `Bulk Test Project 1 ${Date.now()}`,
        description: "First test project",
        createdBy: user.id
    });
    
    const project2 = await apiCall(`${API}/projects`, "POST", {
        name: `Bulk Test Project 2 ${Date.now()}`,
        description: "Second test project",
        createdBy: user.id
    });
    
    console.log("Created projects:", [project1.id, project2.id]);
    
    // Delete all projects for user
    console.log("Deleting all user projects...");
    const deleteResult = await apiCall(`${DELETE_API}/users/${user.id}/projects`, "DELETE");
    console.log("Delete result:", deleteResult);
    console.log(`Deleted ${deleteResult.count} projects`);
    
    // Cleanup user
    await apiCall(`${DELETE_API}/users/${user.id}`, "DELETE");
    
    console.log("✅ Bulk project delete test completed");
}

// ============= BRANCH COMMITS TESTS =============
async function testBranchCommitsDelete() {
    console.log("\n=== Testing Branch Commits Delete ===");
    
    // Setup
    const user = await apiCall(`${API}/auth/users`, "POST", {
        name: `bc_test_user_${Date.now()}`,
        type: "human",
        password: "testpass123"
    });
    
    const project = await apiCall(`${API}/projects`, "POST", {
        name: `BC Test Project ${Date.now()}`,
        description: "Test project",
        createdBy: user.id
    });
    
    const branch = await apiCall(`${API}/branches`, "POST", {
        projectId: project.id,
        name: `test-branch-${Date.now()}`,
        headCommitId: null,
        createdBy: user.id
    });
    
    const commit = await apiCall(`${API}/commits`, "POST", {
        projectId: project.id,
        branchId: branch.id,
        authorId: user.id,
        title: "Test commit",
        content: "Test content"
    });
    
    console.log("Created branch and commit");
    
    // Clear all commits from branch
    console.log("Clearing branch commits...");
    const deleteResult = await apiCall(`${DELETE_API}/branches/${branch.id}/commits`, "DELETE");
    console.log("Delete result:", deleteResult);
    
    // Cleanup
    await apiCall(`${DELETE_API}/commits/${commit.id}`, "DELETE");
    await apiCall(`${DELETE_API}/branches/${branch.id}`, "DELETE");
    await apiCall(`${DELETE_API}/projects/${project.id}`, "DELETE");
    await apiCall(`${DELETE_API}/users/${user.id}`, "DELETE");
    
    console.log("✅ Branch commits delete test completed");
}

// ============= DELETE BY NAME TESTS =============
async function testDeleteByName() {
    console.log("\n=== Testing Delete By Name ===");
    
    // Create user with specific name
    const userName = `named_user_${Date.now()}`;
    console.log(`Creating user with name: ${userName}`);
    const user = await apiCall(`${API}/auth/users`, "POST", {
        name: userName,
        type: "human",
        password: "testpass123"
    });
    console.log("Created user:", user);
    
    // Delete by name
    console.log("Deleting user by name...");
    const deleteResult = await apiCall(`${DELETE_API}/users/by-name/${userName}`, "DELETE");
    console.log("Delete result:", deleteResult);
    
    console.log("✅ Delete by name test completed");
}

// ============= MAIN TEST RUNNER =============
async function main() {
    console.log("🚀 Starting Delete Routes Tests");
    console.log("================================");
    
    try {
        // Run all tests
        await testUserDelete();
        await testProjectDelete();
        await testBranchDelete();
        await testCommitDelete();
        await testBulkProjectDelete();
        await testBranchCommitsDelete();
        await testDeleteByName();
        
        console.log("\n================================");
        console.log("✅ All delete route tests completed successfully!");
        console.log("================================\n");
        
    } catch (err) {
        console.error("\n❌ Test failed with error:");
        console.error(err);
        console.log("\nAttempting cleanup of created resources...");
        
        // Attempt cleanup
        try {
            for (const commitId of createdIds.commits) {
                await apiCall(`${DELETE_API}/commits/${commitId}`, "DELETE").catch(() => {});
            }
            for (const branchId of createdIds.branches) {
                await apiCall(`${DELETE_API}/branches/${branchId}`, "DELETE").catch(() => {});
            }
            for (const projectId of createdIds.projects) {
                await apiCall(`${DELETE_API}/projects/${projectId}`, "DELETE").catch(() => {});
            }
            for (const userId of createdIds.users) {
                await apiCall(`${DELETE_API}/users/${userId}`, "DELETE").catch(() => {});
            }
            console.log("Cleanup completed");
        } catch (cleanupErr) {
            console.error("Cleanup failed:", cleanupErr);
        }
    }
}

// Run tests
main();

// Made with Bob
