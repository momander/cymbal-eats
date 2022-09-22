#!/usr/bin/env bash

# Copyright 2022 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

source ../../config-env.sh

export BASE_DIR=$PWD

export DB_INSTANCE=menu-inventory

if [[ "${_SPANNER_INSTANCE_NAME}" ]]; then
  export DB_INSTANCE=${_SPANNER_INSTANCE_NAME}
fi

export DB_NAME=menu-inventory

gcloud services enable \
    spanner.googleapis.com \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com

gcloud spanner instances create $DB_INSTANCE \
    --config=regional-${REGION} \
    --description="Cymbal Menu Inventory" \
    --processing-units=100

# Disabling the update to speed up the labs setup
# For long running projects, its recommended to update processing units after instance creation to minimize the cost
# gcloud alpha spanner instances update $DB_INSTANCE --processing-units=100

export DB_CONNECTION_STRING=projects/$PROJECT_ID/instances/$DB_INSTANCE/databases/$DB_NAME

gcloud projects add-iam-policy-binding $PROJECT_ID \
--member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
--role="roles/spanner.databaseAdmin"


if [[ "${_APP_NAME}" ]]; then
  export INVENTORY_SERVICE_NAME=${_APP_NAME}
fi

gcloud run deploy $INVENTORY_SERVICE_NAME \
    --source . \
    --region $REGION \
    --update-env-vars SPANNER_CONNECTION_STRING=$DB_CONNECTION_STRING \
    --allow-unauthenticated \
    --project=$PROJECT_ID \
    --quiet
