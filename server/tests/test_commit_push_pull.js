// test-api.js

const API = "http://localhost:3000/api";

// Replace these after creating sample data
const projectId = "PROJECT_ID";
const branchId = "BRANCH_ID";
const authorId = "4296f3ac-8fc8-4316-b0ad-9642c92499a2";

async function testCommit() {
    console.log("\n--- Testing Commit ---");

    const res = await fetch(`${API}/commits`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            projectId,
            branchId,
            authorId,
            title: "Added onboarding flow",
            content: "Created first onboarding experience."
        })
    });

    const json = await res.json();

    console.log(json);

    return json;
}

async function testPush() {
    console.log("\n--- Testing Push ---");

    const res = await fetch(`${API}/push`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            projectId,
            branchId,
            authorId,
            title: "Push Demo",
            content: "Testing push endpoint."
        })
    });

    const json = await res.json();

    console.log(json);

    return json;
}

async function testPull() {
    console.log("\n--- Testing Pull ---");

    const res = await fetch(
        `${API}/pull/${branchId}`
    );

    const json = await res.json();

    console.log(json);

    return json;
}

async function main() {

    try {

        await testCommit();

        await testPush();

        await testPull();

        console.log("\n✅ All route tests completed.\n");

    } catch (err) {

        console.error(err);

    }

}

main();