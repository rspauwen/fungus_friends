import { Checkbox, Divider, Drawer, FormControl, FormControlLabel, FormHelperText, InputLabel, List, ListItem, ListItemIcon, ListItemText, MenuItem, Select, TextField } from '@material-ui/core';
import AddLocationIcon from '@material-ui/icons/AddLocation';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import FilterListIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/SearchRounded';
import React from 'react';
import { confirmAlert } from 'react-confirm-alert';
import MediaQuery from 'react-responsive';
import { toast } from 'react-toastify';
import { Fungus } from '../../model/fungus';
import styles from './FungusDrawer.module.scss';

export default class FungusDrawer extends React.Component
    <{ mapState, closeDrawerCallback, enableAddFungusCallback, refreshMapCallback, searchCallBack }> {

    state = {
        searchedFungi: [],
        searchTerm: '',
        selectedColor: '',
        selectedSpots: '',
        addFungusModalOpened: false,
        customFungiVisible: true
    };

    handleFilterColor = (e) => {
        const selectedColor = e.target.value;
        this.setState({ selectedColor: selectedColor }, this.updateFilters);
    };

    handleFilterSpots = (e) => {
        const selectedSpots = e.target.value;
        this.setState({ selectedSpots: selectedSpots }, this.updateFilters);
    };

    handleShowCustomFungi = (e) => {
        const customFungiVisible = e.target.checked;
        this.setState({ customFungiVisible: customFungiVisible }, this.updateFilters);
    }

    updateFilters = () => {
        const selectedColor = this.state.selectedColor;
        const selectedSpot = this.state.selectedSpots;
        const customFungiVisible = this.state.customFungiVisible;

        this.props.mapState.fungi.forEach((fungus: Fungus) => {
            fungus.isHidden = !customFungiVisible && fungus.isCustom ||
                selectedColor != '' && selectedColor != fungus.color.toString() ||
                selectedSpot != '' && selectedSpot != fungus.spots.toString();
        });

        this.props.refreshMapCallback(this.props.mapState.fungi);
    };

    handleClearFilters = () => {
        this.setState({ selectedColor: '', selectedSpots: '', customFungiVisible: true })

        this.props.mapState.fungi.forEach((f) => {
            f.isHidden = false;
        });
        this.props.refreshMapCallback(this.props.mapState.fungi);
    };

    handleClearSearch = () => {
        this.setState({ searchedFungi: [], searchTerm: '' })
        this.props.searchCallBack(null);
    };

    handleCloseDrawer = () => {
        this.setState({ open: false });
    };

    handleOpenDrawer = () => {
        this.setState({ open: true })
    }

    handleSearch = (e) => {
        const searchTerm = e.target.value;

        let searchedFungi = [];

        if (searchTerm != '') {
            searchedFungi = searchTerm == '*' ? this.props.mapState.fungi :
                this.props.mapState.fungi.filter((f) => f.name.includes(searchTerm));
        }

        this.setState({ searchedFungi: searchedFungi, searchTerm: searchTerm });
    };

    handleSearchItemClicked = (fungus: Fungus) => {
        if (!fungus.isHidden) {
            this.props.searchCallBack(fungus);
            return
        }

        const unhideDialog = ({ onClose }) => {
            const handleClickedNo = () => {
                onClose();
            }
            const handleClickedYes = () => {
                onClose();
                fungus.isHidden = false;
                this.props.searchCallBack(fungus);
            }
            return (
                <div className={styles.fungus_unhide_dialog}>
                    <h3>{`Fungus "${fungus.name}" is filtered at the moment`}</h3>
                    <p>Do you want to make it visible again?</p>
                    <div className={styles.fungus_unhide_dialog_buttons}>
                        <button onClick={handleClickedNo}>No</button>
                        <button onClick={handleClickedYes}>Yes</button>
                    </div>
                </div>
            );
        }

        confirmAlert({ customUI: unhideDialog })
    };

    handleAddFungusClicked = () => {
        this.handleClearFilters();

        if (window.innerWidth < 1440) {
            this.props.closeDrawerCallback();
        }

        toast.info(`Go ahead, click somewhere on the map!`);
        this.props.enableAddFungusCallback(true);
    };

    render() {
        if (this.props.mapState.fungi == null) {
            return null;
        }

        const visibleFungi = this.props.mapState.fungi?.filter((f) => !f.isHidden);

        const colors = visibleFungi.map(f => f.color.toString()).filter((v, i, s) => s.indexOf(v) === i);
        const spots = visibleFungi.map(f => f.spots).filter((v, i, s) => s.indexOf(v) === i);

        const hasNoFilter = this.state.selectedColor == '' && this.state.selectedSpots == '';

        const clearSearchButton = this.state.searchedFungi.length > 0 ?
            <ListItem button key="search_clear" onClick={() => { this.handleClearSearch() }}>
                <ListItemIcon>{<ClearAllIcon />}</ListItemIcon>
                <ListItemText primary="Clear search" />
            </ListItem> : null;

        const clearFiltersButton = hasNoFilter ? null :
            <ListItem button disabled={hasNoFilter} key="filter_clear" onClick={() => { this.handleClearFilters() }}>
                <ListItemIcon>{<ClearAllIcon />}</ListItemIcon>
                <ListItemText primary="Clear filters" />
            </ListItem>;

        const drawerContent = (
            <div className={styles.fungus_drawer_list}>
                <List>
                    <ListItem key='fungus_drawer_counter'>
                        <ListItemIcon>{<BubbleChartIcon />}</ListItemIcon>
                        <ListItemText secondary={`Fungi on map: ${visibleFungi.length}`} />
                    </ListItem>
                    <Divider variant="middle" />
                    <ListItem key="fungus_drawer_filter">
                        <ListItemIcon>{<FilterListIcon />}</ListItemIcon>
                        <ListItemText primary="Filters" />
                    </ListItem>

                    {clearFiltersButton}

                    <div className={styles.fungus_drawer_filter} key="filter_color">
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="drawer_filter_color_label">Color</InputLabel>
                            <Select label="Color"
                                labelId="drawer_filter_color_label"
                                id="drawer_filter_color_input"
                                value={this.state.selectedColor}
                                onChange={this.handleFilterColor}
                                autoWidth
                            >
                                <MenuItem value="">
                                    <em>*</em>
                                </MenuItem>
                                {colors.map((c) => (
                                    <MenuItem value={c} key={c}>
                                        <em>{c}</em>
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Filter by color</FormHelperText>
                        </FormControl>
                    </div>
                    <div className={`${styles.fungus_drawer_filter}`} key="filter_spots">
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="drawer_filter_spots_label">Spots</InputLabel>
                            <Select label="Spots"
                                labelId="drawer_filter_spots_label"
                                id="drawer_filter_spots_input"
                                value={this.state.selectedSpots}
                                onChange={this.handleFilterSpots}
                                autoWidth
                            >
                                <MenuItem value="">
                                    <em>*</em>
                                </MenuItem>
                                {spots.map((s) => (
                                    <MenuItem value={s} key={s}>
                                        <em>{s}</em>
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Filter by spots</FormHelperText>
                        </FormControl>
                    </div>
                    <div className={`${styles.fungus_drawer_filter}`} key="filter_custom">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.customFungiVisible}
                                    onChange={this.handleShowCustomFungi}
                                    name="customFungiCheckbox"
                                    color="secondary"
                                />
                            }
                            label="Show added fungi"
                        />
                    </div>

                    <Divider variant="middle" />

                    <ListItem key='fungus_drawer_search'>
                        <ListItemIcon>{<SearchIcon />}</ListItemIcon>
                        <ListItemText primary="Search" />
                    </ListItem>
                    {clearSearchButton}
                    <form className={styles.fungus_drawer_search} noValidate autoComplete="off">
                        <TextField value={this.state.searchTerm} label="Search by name" variant="outlined" onChange={this.handleSearch} />
                    </form>
                    {this.state.searchedFungi.map((f: Fungus, i) => (
                        <ListItem button key={`search_result_${i}`} onClick={() => this.handleSearchItemClicked(f)} >
                            <ListItemText primary={!f.isHidden ? f.name : null} secondary={f.isHidden ? f.name : null} />
                        </ListItem>
                    ))}

                    <Divider variant="middle" />

                    <ListItem button disabled={!this.props.mapState.drawerOpen || this.props.mapState.fungi.length == 0}
                        key="add_location" onClick={() => { this.handleAddFungusClicked() }}>
                        <ListItemIcon >{<AddLocationIcon />}</ListItemIcon>
                        <ListItemText primary="Add fungus" />
                    </ListItem>
                </List>
            </div>
        );

        return (
            <div>
                <React.Fragment>
                    <MediaQuery maxWidth={1440}>
                        <Drawer classes={{ root: styles.fungus_drawer, paper: styles.fungus_drawer_paper }}
                            anchor='right' open={this.props.mapState.drawerOpen} onClose={() => this.props.closeDrawerCallback()}>
                            {drawerContent}
                        </Drawer>
                    </MediaQuery>
                    <MediaQuery minWidth={1440}>
                        <Drawer classes={{ root: styles.fungus_drawer, paper: styles.fungus_drawer_paper }}
                            anchor='right' open={this.props.mapState.drawerOpen} variant="permanent">
                            {drawerContent}
                        </Drawer>
                    </MediaQuery>
                </React.Fragment>
            </div >
        );
    }
}
