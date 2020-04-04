import { Divider, Drawer, FormControl, FormHelperText, InputLabel, List, ListItem, ListItemIcon, ListItemText, MenuItem, Select, TextField } from '@material-ui/core';
import AddLocationIcon from '@material-ui/icons/AddLocation';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import FilterListIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/Search';
import React from 'react';
import { Fungus } from '../../model/fungus';
import { LatLng } from '../../model/latlng';
import styles from './FungusDrawer.module.scss';

export default class FungusDrawer extends React.Component<{ fungi, clickedLoc, filterCallback, searchCallBack }> {
    state = {
        open: false,
        searchedFungi: [],
        searchTerm: '',
        selectedColor: '',
        selectedSpots: '',
    };

    private searchInputRef;

    constructor(props) {
        super(props)
        this.searchInputRef = React.createRef()
    }

    openDrawer = () => {
        this.setState({ open: true })
    }

    closeDrawer = () => {
        this.setState({ open: false })
    }

    handleFilterColor = (e) => {
        const selectedColor = e.target.value;
        this.setState({ selectedColor: selectedColor })
        this.handleFilter(true, selectedColor);
    };

    handleFilterSpots = (e) => {
        const selectedSpots = e.target.value;
        this.setState({ selectedSpots: selectedSpots })
        this.handleFilter(false, selectedSpots);
    };

    handleFilter = (isColor: boolean, val: String) => {
        const selectedColor = isColor ? val : this.state.selectedColor;
        const selectedSpots = !isColor ? val : this.state.selectedSpots;

        this.props.fungi.forEach((f) => {
            f.isHidden = selectedColor != '' && f.color.toString() != selectedColor || selectedSpots != '' && f.spots.toString() != selectedSpots;
        });

        this.props.filterCallback(this.props.fungi);
    };

    handleClearFilters = () => {
        this.setState({ selectedColor: '', selectedSpots: '' })

        this.props.fungi.forEach((f) => {
            f.isHidden = false;
        });
        this.props.filterCallback(this.props.fungi);
    };

    handleClearSearch = () => {
        this.setState({ searchedFungi: [], searchTerm: '' })
        this.props.searchCallBack('');
    };

    handleSearch = (e) => {
        const searchTerm = e.target.value;

        let searchedFungi = [];

        if (searchTerm != '') {
            searchedFungi = searchTerm == '*' ? this.props.fungi : this.props.fungi.filter((f) => f.name.includes(searchTerm));
        }

        this.setState({ searchedFungi: searchedFungi, searchTerm: searchTerm });
    };

    handleSearchItemClicked = (f: Fungus) => {
        if (f.isHidden) {
            // TBD: ask to make it visible?
        } else {
            this.props.searchCallBack(f.name);
            // TODO: expand the popup
            this.closeDrawer();
        }
    };


    render() {
        const fungi = this.props.fungi.filter((f) => !f.isHidden);

        const colors = fungi.map(f => f.color.toString()).filter((v, i, s) => s.indexOf(v) === i);
        const spots = fungi.map(f => f.spots).filter((v, i, s) => s.indexOf(v) === i);

        const hasNoFilter = this.state.selectedColor == '' && this.state.selectedSpots == '';

        const clearSearchButton = this.state.searchedFungi.length > 0 ?
            <ListItem button key="search_clear" onClick={() => { this.handleClearSearch() }}>
                <ListItemIcon>{<ClearAllIcon />}</ListItemIcon>
                <ListItemText primary="Clear search" />
            </ListItem> : null;

        // TBD: move to a separate modal instead of inside the drawer
        const addFungusClickedLocation = this.props.clickedLoc != null ? (
            <div>
                <ListItem key='fungus_drawer_add'>
                    <ListItemIcon>{<AddLocationIcon />}</ListItemIcon>
                    <ListItemText secondary="Clicked location" />
                </ListItem>

                <form className={styles.fungus_drawer_add} noValidate autoComplete="off">
                    <TextField value={this.props.clickedLoc.lat} variant="filled"
                        label="Latitude" InputProps={{ readOnly: true }} />
                    <TextField value={this.props.clickedLoc.lng} variant="filled"
                        label="Longitude" InputProps={{ readOnly: true }} />
                    <TextField label="Name" />
                    <TextField label="Color" /> {/* TODO: add select box */}
                    <TextField label="Spots" /> {/* TODO: add select box */}
                    <ListItem button key="add_location" onClick={() => { }}>
                        <ListItemText primary="Add fungus" />
                    </ListItem>
                </form>
            </div>
        ) : null;

        const drawerContent = (
            <div className={styles.fungus_drawer_list}>
                <List>
                    <ListItem key='fungus_drawer_counter'>
                        <ListItemIcon>{<BubbleChartIcon />}</ListItemIcon>
                        <ListItemText secondary={`Fungi on map: ${fungi.length}`} />
                    </ListItem>

                    <Divider variant="middle" />

                    <ListItem key="fungus_drawer_filter">
                        <ListItemIcon>{<FilterListIcon />}</ListItemIcon>
                        <ListItemText primary="Filters" />
                    </ListItem>
                    <div className={styles.fungus_drawer_filter} key="filter_color">
                        <FormControl fullWidth={true} variant="outlined">
                            <InputLabel id="demo-simple-select-outlined-label">Color</InputLabel>
                            <Select
                                labelId="fungus_drawer_filter_color-label"
                                id="fungus_drawer_filter_color"
                                value={this.state.selectedColor}
                                onChange={this.handleFilterColor}
                                label="Color"
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
                        <FormControl fullWidth={true} variant="outlined">
                            <InputLabel id="demo-simple-select-outlined-label">Spots</InputLabel>
                            <Select
                                labelId="fungus_drawer_filter_color-label"
                                id="fungus_drawer_filter_color"
                                value={this.state.selectedSpots}
                                onChange={this.handleFilterSpots}
                                label="Spots"
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
                    <ListItem button disabled={hasNoFilter} key="filter_clear" onClick={() => { this.handleClearFilters() }}>
                        <ListItemIcon>{<ClearAllIcon />}</ListItemIcon>
                        <ListItemText primary="Clear filters" />
                    </ListItem>

                    <Divider variant="middle" />

                    <ListItem key='fungus_drawer_search'>
                        <ListItemIcon>{<SearchIcon />}</ListItemIcon>
                        <ListItemText primary="Search" />
                    </ListItem>
                    <form className={styles.fungus_drawer_search} noValidate autoComplete="off">
                        <TextField value={this.state.searchTerm} label="Search by name" variant="outlined" onChange={this.handleSearch} />
                    </form>
                    {this.state.searchedFungi.map((f: Fungus, i) => (
                        <ListItem button key={`search_result_${i}`} onClick={() => this.handleSearchItemClicked(f)} >
                            <ListItemText primary={!f.isHidden ? f.name : null} secondary={f.isHidden ? f.name : null} />
                        </ListItem>
                    ))}
                    {clearSearchButton}

                    <Divider variant="middle" />

                    {addFungusClickedLocation}
                </List>
            </div>
        );


        return (
            <div>
                <React.Fragment>
                    <Drawer anchor='right'
                        classes={{ root: styles.fungus_drawer, paper: styles.fungus_drawer_paper }}
                        open={this.state.open}
                        onClose={this.closeDrawer}
                        elevation={0}
                    >
                        {drawerContent}
                    </Drawer>
                </React.Fragment>
            </div >
        );
    }
}
