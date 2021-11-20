// Copyright (C) 2021 Clavicode Team
// 
// This file is part of clavicode-frontend.
// 
// clavicode-frontend is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// clavicode-frontend is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with clavicode-frontend.  If not, see <http://www.gnu.org/licenses/>.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { OjGetProblemResponse, OjListProblemSetsResponse, OjListProblemsResponse } from '../api';

type ProblemDescription = {
  title: string;
  description: string;
  aboutInput: string;
  aboutOutput: string;
  sampleInput: string;
  sampleOutput: string;
  hint: string;
};

const LIST_PROBLEM_SET_URL = `//${environment.backendHost}/oj/listProblemSets`;
const LIST_PROBLEM_URL = `//${environment.backendHost}/oj/listProblems/`;


@Injectable({
  providedIn: 'root'
})
export class OjService {

  problemDescription: ProblemDescription | null = null;
  problemId: string[] = [];

  constructor(private http: HttpClient) { }

  async listProblemSets() {
    const res = await this.http.get<OjListProblemSetsResponse>(LIST_PROBLEM_SET_URL).toPromise();
    if (!res.success) {
      alert("Load set list failed");
      return null;
    }
    return res.problemSets;
  }

  async listProblems(setId: string) {
    const res = await this.http.get<OjListProblemsResponse>(LIST_PROBLEM_URL + setId).toPromise();
    if (!res.success) {
      alert("Load problem list failed");
      return null;
    }
    return res.problems;
  }

  async updateDescription(value: string[]) {
    this.problemId = value;
    this.problemDescription = await (async () => {
      console.log(this.problemId);
      if (this.problemId.length === 0) return null;
      const [setId, problemId] = this.problemId;
      const res = await this.http.get<OjGetProblemResponse>(`//${environment.backendHost}/oj/getProblem/${setId}/${problemId}`).toPromise();
      if (!res.success) {
        alert("Load problem failed");
        return null;
      }
      return res;
    })();
  }

}
