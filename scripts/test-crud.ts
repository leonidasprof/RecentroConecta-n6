// CRUD AUTOMATED TEST SCRIPT
// Run this to verify CREATE and DELETE operations work correctly

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

interface TestResult {
  operation: string
  entity: string
  success: boolean
  details: string
  timestamp: string
}

const results: TestResult[] = []

async function logResult(operation: string, entity: string, success: boolean, details: string) {
  const result: TestResult = {
    operation,
    entity,
    success,
    timestamp: new Date().toISOString(),
    details,
  }
  results.push(result)
  console.log(
    `[${success ? "✓" : "✗"}] ${operation} ${entity}: ${details}`,
  )
}

async function testEmployeeCRUD() {
  console.log("\n=== TESTING EMPLOYEES CRUD ===\n")

  // CREATE
  const employeeData = {
    name: `Test Employee ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    role: "guide",
  }

  try {
    const createResponse = await fetch(`${BASE_URL}/api/employees/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData),
    })

    const createResult = await createResponse.json()

    if (createResponse.ok && createResult.success) {
      await logResult("CREATE", "EMPLOYEE", true, `Created employee ID: ${createResult.employee.id}`)

      // READ - verify it appears in list
      const listResponse = await fetch(`${BASE_URL}/api/employees/list`)
      const listResult = await listResponse.json()

      const found = listResult.data.find((e: any) => e.id === createResult.employee.id)
      if (found) {
        await logResult("READ", "EMPLOYEE", true, `Employee found in list`)
      } else {
        await logResult("READ", "EMPLOYEE", false, `Employee NOT found in list after creation`)
      }

      // DELETE
      const deleteResponse = await fetch(`${BASE_URL}/api/employees/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: createResult.employee.id }),
      })

      if (deleteResponse.ok) {
        await logResult("DELETE", "EMPLOYEE", true, `Employee deleted successfully`)

        // READ - verify it's gone
        const listAfterDelete = await fetch(`${BASE_URL}/api/employees/list`)
        const listAfterDeleteResult = await listAfterDelete.json()

        const stillThere = listAfterDeleteResult.data.find((e: any) => e.id === createResult.employee.id)
        if (!stillThere) {
          await logResult("READ AFTER DELETE", "EMPLOYEE", true, `Employee correctly removed from list`)
        } else {
          await logResult("READ AFTER DELETE", "EMPLOYEE", false, `Employee STILL in list after deletion`)
        }
      } else {
        await logResult("DELETE", "EMPLOYEE", false, `Delete failed: ${deleteResponse.status}`)
      }
    } else {
      await logResult("CREATE", "EMPLOYEE", false, `Create failed: ${createResult.error || createResponse.status}`)
    }
  } catch (error: any) {
    await logResult("CREATE", "EMPLOYEE", false, `Exception: ${error.message}`)
  }
}

async function testPartnerCRUD() {
  console.log("\n=== TESTING PARTNERS CRUD ===\n")

  const partnerData = {
    name: `Test Partner ${Date.now()}`,
    email: `partner${Date.now()}@example.com`,
    organization: "Hotel",
    phone: "81999999999",
  }

  try {
    const createResponse = await fetch(`${BASE_URL}/api/partners/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partnerData),
    })

    const createResult = await createResponse.json()

    if (createResponse.ok && createResult.success) {
      await logResult("CREATE", "PARTNER", true, `Created partner ID: ${createResult.data.id}`)

      const listResponse = await fetch(`${BASE_URL}/api/partners/list`)
      const listResult = await listResponse.json()

      const found = listResult.data.find((p: any) => p.id === createResult.data.id)
      if (found) {
        await logResult("READ", "PARTNER", true, `Partner found in list`)
      } else {
        await logResult("READ", "PARTNER", false, `Partner NOT found in list after creation`)
      }

      const deleteResponse = await fetch(`${BASE_URL}/api/partners/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: createResult.data.id }),
      })

      if (deleteResponse.ok) {
        await logResult("DELETE", "PARTNER", true, `Partner deleted successfully`)

        const listAfterDelete = await fetch(`${BASE_URL}/api/partners/list`)
        const listAfterDeleteResult = await listAfterDelete.json()

        const stillThere = listAfterDeleteResult.data.find((p: any) => p.id === createResult.data.id)
        if (!stillThere) {
          await logResult("READ AFTER DELETE", "PARTNER", true, `Partner correctly removed from list`)
        } else {
          await logResult("READ AFTER DELETE", "PARTNER", false, `Partner STILL in list after deletion`)
        }
      } else {
        await logResult("DELETE", "PARTNER", false, `Delete failed: ${deleteResponse.status}`)
      }
    } else {
      await logResult("CREATE", "PARTNER", false, `Create failed: ${createResult.error || createResponse.status}`)
    }
  } catch (error: any) {
    await logResult("CREATE", "PARTNER", false, `Exception: ${error.message}`)
  }
}

async function testSculptureCRUD() {
  console.log("\n=== TESTING SCULPTURES CRUD ===\n")

  const sculptureData = {
    sculpture_number: `TEST-${Date.now()}`,
    name: `Test Sculpture ${Date.now()}`,
    code: Math.floor(Math.random() * 1000),
    description: "Test sculpture for automated testing",
    curiosity: "This is a test sculpture",
  }

  try {
    const createResponse = await fetch(`${BASE_URL}/api/sculptures/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sculptureData),
    })

    const createResult = await createResponse.json()

    if (createResponse.ok && createResult.success) {
      await logResult("CREATE", "SCULPTURE", true, `Created sculpture ID: ${createResult.data.id}`)

      const listResponse = await fetch(`${BASE_URL}/api/sculptures/list`)
      const listResult = await listResponse.json()

      const found = listResult.data.find((s: any) => s.id === createResult.data.id)
      if (found) {
        await logResult("READ", "SCULPTURE", true, `Sculpture found in list`)
      } else {
        await logResult("READ", "SCULPTURE", false, `Sculpture NOT found in list after creation`)
      }

      const deleteResponse = await fetch(`${BASE_URL}/api/sculptures/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sculptureId: createResult.data.id }),
      })

      if (deleteResponse.ok) {
        await logResult("DELETE", "SCULPTURE", true, `Sculpture deleted successfully`)

        const listAfterDelete = await fetch(`${BASE_URL}/api/sculptures/list`)
        const listAfterDeleteResult = await listAfterDelete.json()

        const stillThere = listAfterDeleteResult.data.find((s: any) => s.id === createResult.data.id)
        if (!stillThere) {
          await logResult("READ AFTER DELETE", "SCULPTURE", true, `Sculpture correctly removed from list`)
        } else {
          await logResult("READ AFTER DELETE", "SCULPTURE", false, `Sculpture STILL in list after deletion`)
        }
      } else {
        await logResult("DELETE", "SCULPTURE", false, `Delete failed: ${deleteResponse.status}`)
      }
    } else {
      await logResult("CREATE", "SCULPTURE", false, `Create failed: ${createResult.error || createResponse.status}`)
    }
  } catch (error: any) {
    await logResult("CREATE", "SCULPTURE", false, `Exception: ${error.message}`)
  }
}

async function runAllTests() {
  console.log("\n" + "=".repeat(60))
  console.log("AUTOMATED CRUD TESTING - RECENTRO CONECTA")
  console.log("=".repeat(60))

  await testEmployeeCRUD()
  await testPartnerCRUD()
  await testSculptureCRUD()

  console.log("\n" + "=".repeat(60))
  console.log("TEST SUMMARY")
  console.log("=".repeat(60) + "\n")

  const passed = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  console.log(`Total Tests: ${results.length}`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%\n`)

  if (failed > 0) {
    console.log("FAILED TESTS:")
    results.filter((r) => !r.success).forEach((r) => {
      console.log(`  - ${r.operation} ${r.entity}: ${r.details}`)
    })
  }

  console.log("\n" + "=".repeat(60))
  console.log(passed === results.length ? "ALL TESTS PASSED ✓" : "SOME TESTS FAILED ✗")
  console.log("=".repeat(60) + "\n")
}

// Run tests
runAllTests().catch(console.error)
