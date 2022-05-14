from fastapi.testclient import TestClient


def test_healthcheck(client: TestClient) -> None:
    rsp = client.get('/api/health/app')
    assert rsp.ok
