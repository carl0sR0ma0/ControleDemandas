#!/usr/bin/env python3
"""
Ferramenta auxiliar para migrar as tarefas descritas em NEXT_TASKS.md
para issues no GitHub e adicioná-las ao projeto "Controle de demandas".

Requer:
- Python 3.8+
- requests (`pip install requests`)
- Token pessoal do GitHub com escopos:
    * `repo`
    * `project`
    * `read:project`

Uso:
    export GITHUB_TOKEN=ghp_xxx
    python scripts/migrate_next_tasks.py \
        --owner carl0sR0ma0 \
        --repo ControleDemandas \
        --project-number 1 \
        --map-file .github/projects/migration-map.json \
        --dry-run

Após validar a saída no modo dry-run, remova `--dry-run` para criar as issues.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Tuple

import requests

NEXT_TASKS_PATH = Path("doc/backlog/NEXT_TASKS.md")
DEFAULT_MAP_PATH = Path(".github") / "projects" / "next_tasks_migration.json"


@dataclass
class Task:
    title: str
    description: str
    acceptance: List[str]

    def to_issue(self) -> Tuple[str, str]:
        """Retorna (title, body) formatado para criação da issue."""
        acceptance_list = "\n".join(f"- [ ] {item}" for item in self.acceptance) or "- [ ] Definir critérios de aceite"
        body = (
            f"### Contexto\n"
            f"{self.description.strip()}\n\n"
            f"### Critérios de aceite\n"
            f"{acceptance_list}\n"
        )
        return self.title.strip(), body


def parse_tasks(markdown: str) -> List[Task]:
    """Extrai tarefas do arquivo NEXT_TASKS.md."""
    sections = re.split(r"\n##\s+", markdown)
    tasks: List[Task] = []

    for section in sections[1:]:
        lines = section.strip().splitlines()
        if not lines:
            continue

        title_line = lines[0].strip()
        title = title_line

        description_lines: List[str] = []
        acceptance: List[str] = []
        collecting_acceptance = False

        for line in lines[1:]:
            if re.match(r"^[*-]\s+\[ \]", line.strip()):
                collecting_acceptance = True
                acceptance.append(line.strip()[5:].strip())
            elif re.match(r"^[*-]\s+", line.strip()) and collecting_acceptance:
                acceptance.append(line.strip()[2:].strip())
            elif line.strip().startswith("- [ ]"):
                collecting_acceptance = True
                acceptance.append(line.strip()[5:].strip())
            elif collecting_acceptance and line.strip():
                acceptance[-1] += " " + line.strip()
            else:
                description_lines.append(line)

        description = "\n".join(description_lines).strip()
        tasks.append(Task(title=title, description=description, acceptance=acceptance))

    return tasks


def get_project_id(session: requests.Session, owner: str, project_number: int) -> str:
    """Obtains the GraphQL ID for a projects v2 board owned by the user/org."""
    query = """
    query($owner: String!, $projectNumber: Int!) {
      user(login: $owner) {
        projectV2(number: $projectNumber) { id }
      }
      organization(login: $owner) {
        projectV2(number: $projectNumber) { id }
      }
    }
    """
    variables = {"owner": owner, "projectNumber": project_number}
    response = session.post(
        "https://api.github.com/graphql",
        json={"query": query, "variables": variables},
    )
    response.raise_for_status()
    data = response.json()

    data_root = data.get("data", {}) if isinstance(data, dict) else {}
    user_project = (data_root.get("user") or {}).get("projectV2")
    org_project = (data_root.get("organization") or {}).get("projectV2")

    if not user_project and not org_project:
        raise RuntimeError(
            f"Projeto number={project_number} nao encontrado ou voce nao tem acesso. Resposta: {data}"
        )

    project = user_project or org_project
    return project["id"]



def create_issue(session: requests.Session, owner: str, repo: str, title: str, body: str, dry_run: bool) -> Optional[int]:
    """Cria issue e retorna o número."""
    if dry_run:
        print(f"[DRY-RUN] Criaria issue: {title}")
        return None

    response = session.post(
        f"https://api.github.com/repos/{owner}/{repo}/issues",
        json={"title": title, "body": body},
    )
    if response.status_code >= 300:
        raise RuntimeError(f"Falha ao criar issue '{title}': {response.status_code} {response.text}")
    issue_number = response.json()["number"]
    print(f"Issue criada #{issue_number}: {title}")
    return issue_number


def add_issue_to_project(session: requests.Session, project_id: str, issue_id: str, dry_run: bool) -> None:
    """Adiciona uma issue (node_id) ao projeto v2."""
    if dry_run:
        print(f"[DRY-RUN] Adicionaria issue node_id={issue_id} ao projeto {project_id}")
        return

    mutation = """
    mutation($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
        item { id }
      }
    }
    """
    response = session.post(
        "https://api.github.com/graphql",
        json={"query": mutation, "variables": {"projectId": project_id, "contentId": issue_id}},
    )
    if response.status_code >= 300:
        raise RuntimeError(f"Falha ao adicionar issue ao projeto: {response.status_code} {response.text}")


def hydrate_session(token: str) -> requests.Session:
    session = requests.Session()
    session.headers.update(
        {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "GraphQL-Features": "projects_next_graphql",
        }
    )
    return session


def load_existing_map(path: Path) -> dict:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def save_map(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
        fh.write("\n")


def main() -> int:
    parser = argparse.ArgumentParser(description="Migra tarefas em NEXT_TASKS.md para issues GitHub.")
    parser.add_argument("--owner", required=True, help="Usuário ou organização do repositório (ex.: carl0sR0ma0)")
    parser.add_argument("--repo", required=True, help="Nome do repositório (ex.: ControleDemandas)")
    parser.add_argument("--project-number", type=int, required=True, help="Número do projeto (veja na URL do projeto)")
    parser.add_argument("--token", default=os.getenv("GITHUB_TOKEN"), help="Token do GitHub (padrão: env GITHUB_TOKEN)")
    parser.add_argument("--map-file", type=Path, default=DEFAULT_MAP_PATH, help="Arquivo JSON para mapear títulos -> issues")
    parser.add_argument("--dry-run", action="store_true", help="Não cria nada, apenas mostra o que seria feito")
    args = parser.parse_args()

    if not args.token:
        print("Erro: defina --token ou a variável de ambiente GITHUB_TOKEN com um PAT válido.", file=sys.stderr)
        return 1

    if not NEXT_TASKS_PATH.exists():
        print(f"Arquivo {NEXT_TASKS_PATH} não encontrado.", file=sys.stderr)
        return 1

    markdown = NEXT_TASKS_PATH.read_text(encoding="utf-8")
    tasks = parse_tasks(markdown)
    if not tasks:
        print("Nenhuma tarefa encontrada em NEXT_TASKS.md.")
        return 0

    session = hydrate_session(args.token)
    project_id = None

    issue_map = load_existing_map(args.map_file)

    for task in tasks:
        title, body = task.to_issue()

        if title in issue_map:
            print(f"Pulado (já migrado): {title} -> issue #{issue_map[title]['number']}")
            continue

        if project_id is None:
            project_id = get_project_id(session, args.owner, args.project_number)

        if args.dry_run:
            print(f"[DRY-RUN] Criaria issue: {title}")
            print(body)
            issue_number = None
            node_id = None
        else:
            response = session.post(
                f"https://api.github.com/repos/{args.owner}/{args.repo}/issues",
                json={"title": title, "body": body},
            )
            if response.status_code >= 300:
                raise RuntimeError(f"Falha ao criar issue '{title}': {response.status_code} {response.text}")
            data = response.json()
            issue_number = data["number"]
            node_id = data["node_id"]
            print(f"Issue criada #{issue_number}: {title}")

            add_issue_to_project(session, project_id, node_id, args.dry_run)

        if issue_number is not None:
            issue_map[title] = {"number": issue_number}

    if not args.dry_run:
        save_map(args.map_file, issue_map)

    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"Erro: {exc}", file=sys.stderr)
        sys.exit(1)
