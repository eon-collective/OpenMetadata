/*
 *  Copyright 2022 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Button, MenuItem, Tooltip, useTheme } from '@mui/material';
import classNames from 'classnames';
import QueryString from 'qs';
import {
  FC,
  memo,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as DropdownIcon } from '../../../assets/svg/drop-down.svg';
import { ReactComponent as ExitFullScreenIcon } from '../../../assets/svg/ic-exit-fullscreen.svg';
import { ReactComponent as FilterLinesIcon } from '../../../assets/svg/ic-filter-lines.svg';
import { ReactComponent as FullscreenIcon } from '../../../assets/svg/ic-fullscreen.svg';
import { LINEAGE_DROPDOWN_ITEMS } from '../../../constants/AdvancedSearch.constants';
import { FULLSCREEN_QUERY_PARAM_KEY } from '../../../constants/constants';
import { useConversionProvider } from '../../../context/ConversionProvider/ConversionProvider';
import { SearchIndex } from '../../../enums/search.enum';
import { LineageDirection } from '../../../generated/api/lineage/entityCountLineageRequest';
import useCustomLocation from '../../../hooks/useCustomLocation/useCustomLocation';
import { ExploreQuickFilterField } from '../../Explore/ExplorePage.interface';
import ExploreQuickFilters from '../../Explore/ExploreQuickFilters';
import {
  StyledIconButton,
  StyledMenu,
} from '../../LineageTable/LineageTable.styled';
import ConversionSearchSelect from './ConversionSearchSelect';

const CustomControls: FC<{
  nodeDepthOptions?: number[];
  onSearchValueChange?: (value: string) => void;
  searchValue?: string;
  queryFilterNodeIds?: string[];
}> = ({
  nodeDepthOptions,
  onSearchValueChange,
  searchValue,
  queryFilterNodeIds,
}) => {
  const { t } = useTranslation();
  const {
    setSelectedQuickFilters,
    nodes,
    selectedQuickFilters,
    lineageConfig,
  } = useConversionProvider();
  const [filterSelectionActive, setFilterSelectionActive] = useState(false);
  const [nodeDepthAnchorEl, setNodeDepthAnchorEl] =
    useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useCustomLocation();
  const theme = useTheme();

  const queryFilter = useMemo(() => {
    const nodeIds = (nodes ?? [])
      .map((node) => node.data?.node?.id)
      .filter(Boolean);

    return {
      query: {
        bool: {
          must: {
            terms: {
              'id.keyword': queryFilterNodeIds ?? nodeIds,
            },
          },
        },
      },
    };
  }, [nodes, queryFilterNodeIds]);

  const handleQuickFiltersValueSelect = useCallback(
    (field: ExploreQuickFilterField) => {
      setSelectedQuickFilters((pre) => {
        const data = pre.map((preField) => {
          if (preField.key === field.key) {
            return field;
          } else {
            return preField;
          }
        });

        return data;
      });
    },
    [setSelectedQuickFilters]
  );

  // Initialize quick filters on component mount
  useEffect(() => {
    const updatedQuickFilters = LINEAGE_DROPDOWN_ITEMS.map(
      (selectedFilterItem) => {
        const originalFilterItem = selectedQuickFilters?.find(
          (filter) => filter.key === selectedFilterItem.key
        );

        return {
          ...(originalFilterItem || selectedFilterItem),
          value: originalFilterItem?.value || [],
        };
      }
    );

    if (updatedQuickFilters.length > 0) {
      setSelectedQuickFilters(updatedQuickFilters);
    }
  }, []);
  const queryParams = useMemo(() => {
    return QueryString.parse(location.search, {
      ignoreQueryPrefix: true,
    });
  }, [location.search]);

  const { isFullScreen, nodeDepth, activeTab } = useMemo(() => {
    const lineageDirection =
      queryParams['dir'] === LineageDirection.Upstream
        ? LineageDirection.Upstream
        : LineageDirection.Downstream;

    const directionalDepth =
      lineageDirection === LineageDirection.Downstream
        ? lineageConfig.downstreamDepth
        : lineageConfig.upstreamDepth;

    const nodeDepth = Number.isNaN(Number(queryParams['depth']))
      ? directionalDepth
      : Number(queryParams['depth']);

    return {
      activeTab:
        queryParams['mode'] === 'impact_analysis'
          ? 'impact_analysis'
          : 'lineage',
      isFullScreen: queryParams[FULLSCREEN_QUERY_PARAM_KEY] === 'true',
      nodeDepth,
      // lineageDirection,
    };
  }, [queryParams, lineageConfig.downstreamDepth, lineageConfig.upstreamDepth]);

  const updateURLParams = useCallback(
    (
      data: Partial<{
        depth: number;
        [FULLSCREEN_QUERY_PARAM_KEY]: boolean;
      }>
    ) => {
      const params = QueryString.parse(location.search, {
        ignoreQueryPrefix: true,
      });
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          params[key] = String(value);
        }
      }

      navigate(
        {
          search: QueryString.stringify(params, {
            encode: false,
            addQueryPrefix: true,
          }),
        },
        { replace: true }
      );
      setNodeDepthAnchorEl(null);
    },
    [location.search]
  );

  const toggleFilterSelection: MouseEventHandler<HTMLButtonElement> =
    useCallback(() => {
      setFilterSelectionActive((prev) => !prev);
    }, [filterSelectionActive, updateURLParams]);

  const handleClearAllFilters = useCallback(() => {
    setSelectedQuickFilters((prev) =>
      (prev ?? []).map((filter) => ({ ...filter, value: [] }))
    );
  }, [setSelectedQuickFilters]);

  const filterApplied = useMemo(() => {
    return selectedQuickFilters.some(
      (filter) => (filter.value ?? []).length > 0
    );
  }, [selectedQuickFilters]);

  const searchBarComponent = useMemo(() => {
    return <ConversionSearchSelect />;
  }, [searchValue, onSearchValueChange]);

  const handleNodeDepthUpdate = useCallback(
    (depth: number) => {
      updateURLParams({ depth });
      setNodeDepthAnchorEl(null);
    },
    [updateURLParams]
  );

  return (
    <div>
      <div className={classNames('d-flex w-full justify-between')}>
        <div className="d-flex items-center gap-4 flex-grow">
          <Tooltip arrow placement="top" title={t('label.filter-plural')}>
            <StyledIconButton
              color={filterSelectionActive ? 'primary' : 'default'}
              size="large"
              onClick={toggleFilterSelection}>
              <FilterLinesIcon />
            </StyledIconButton>
          </Tooltip>
          {searchBarComponent}
        </div>
        <div className="d-flex gap-4 items-center">
          <Tooltip
            arrow
            placement="top"
            title={
              isFullScreen
                ? t('label.exit-full-screen')
                : t('label.full-screen-view')
            }>
            <StyledIconButton
              size="large"
              onClick={() =>
                updateURLParams({ [FULLSCREEN_QUERY_PARAM_KEY]: !isFullScreen })
              }>
              {isFullScreen ? <ExitFullScreenIcon /> : <FullscreenIcon />}
            </StyledIconButton>
          </Tooltip>
        </div>
      </div>
      {filterSelectionActive ? (
        <div className="m-t-sm d-flex items-center justify-between">
          <div>
            <Button
              endIcon={<DropdownIcon />}
              sx={{
                fontWeight: 500,
                '& .MuiButton-endIcon': {
                  svg: {
                    height: 12,
                  },
                },
              }}
              variant="text"
              onClick={(e) => setNodeDepthAnchorEl(e.currentTarget)}>
              {`${t('label.node-depth')}:`}{' '}
              <span className="text-primary m-l-xss">{nodeDepth}</span>
            </Button>
            <StyledMenu
              anchorEl={nodeDepthAnchorEl}
              open={Boolean(nodeDepthAnchorEl)}
              slotProps={{
                paper: {
                  style: {
                    maxHeight: 48 * 4.5,
                    width: '10ch',
                  },
                },
                list: {
                  'aria-labelledby': 'long-button',
                },
              }}
              onClose={() => setNodeDepthAnchorEl(null)}>
              {(nodeDepthOptions ?? [])?.map((depth) => (
                <MenuItem
                  key={depth}
                  selected={depth === nodeDepth}
                  onClick={() => handleNodeDepthUpdate(depth)}>
                  {depth}
                </MenuItem>
              ))}
            </StyledMenu>
            <ExploreQuickFilters
              independent
              aggregations={{}}
              defaultQueryFilter={queryFilter}
              fields={selectedQuickFilters}
              index={SearchIndex.ALL}
              showDeleted={false}
              onFieldValueSelect={handleQuickFiltersValueSelect}
            />
          </div>
          <Button
            disabled={!filterApplied}
            size="small"
            sx={{
              fontWeight: 500,
              color: theme.palette.primary.main,
            }}
            variant="text"
            onClick={handleClearAllFilters}>
            {t('label.clear-entity', { entity: t('label.all') })}
          </Button>
        </div>
      ) : (
        <></>
      )}

      {/* <LineageConfigModal
        config={lineageConfig}
        visible={dialogVisible}
        onCancel={() => setDialogVisible(false)}
        onSave={handleDialogSave}
      /> */}
    </div>
  );
};

export default memo(CustomControls);
