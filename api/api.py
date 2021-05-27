from pathlib import Path
import os
from re import M
from flask import Flask, request, jsonify, session
from flask_session import Session
from datetime import timedelta
import pandas as pd
import geopandas as gpd
import numpy as np
import scipy.stats
import math
import json
import plotly.express as px
import plotly as plt
from plotly.subplots import make_subplots
import plotly.figure_factory as ff
import plotly.graph_objects as go
from PIL import ImageColor
# Datashader and colorcet
import colorcet
import glob
# for time measurement
import time
#Clustering
import hdbscan

own_path = Path(os.path.abspath(os.path.dirname(__file__)))
# Local path to the samples
data_path = Path('../data')

# Loading of data
# df = pd.read_csv('./data/generated_variables_chg_cats.csv')
# df = pd.read_csv(str(data_path)+'/generated_variables.csv', parse_dates=['x0_birthd', 'x0_examd',
#                                                         'x0cs05', 'x0mt06', 'x0mt06a'])

# Load data for questionaire
df = pd.read_csv(str(data_path)+'/generated_variables_questionaire.csv',
                parse_dates=['x0_birthd', 'x0_examd', 'x0cs05', 'x0mt06', 'x0mt06a'])
# df = pd.read_csv(str(data_path)+'/weather_snd_test_df.csv')

# Load dictionary with descriptions
description_unit_dic = None #weather_snd_test_df_dic.json
with open(str(data_path)+'/description_unit_dic.txt', encoding="utf-8") as f:
    description_unit_dic = json.load(f)
    f.close()

# Load shapefiles for the muncipalities to use them later to merge
geod = gpd.read_file(str(data_path)+'/shapefiles/Municipalities_polygon.shp')
geod['ID'] = geod['ID'].astype('str')

# Load raster files and create dictionary of images
# Average (Mittlere?) yearly sunligth exposure in Wh/m^2
# drms = xr.open_rasterio('./DownloadService/EURAC_RADGLOB_YEAR_25m.tif')
# slcmp = ['#d73027','#f46d43','#fdae61','#fee090','#ffffbf','#e0f3f8','#abd9e9','#74add1','#4575b4'][::-1]

# Load img names for carousel in individual page (but to frontend)
pi_image_list = [os.path.basename(f)
                for f in glob.glob(".\\assets\\imgs\\*.png")]


# Mappings dictionary between the shapefile and CHRIS study municipalities
cv_dic_1 = {'GLURNS': 81.0, 'GRAUN I. V.': 40.0, 'KASTELBELL': 94.0, 'LAAS': 79.0, 'LATSCH': 95.0, 'MALS': 53.0, 'MARTELL': 108.0,
            'PRAD A. ST.': 101.0, 'SCHLANDERS': 69.0, 'SCHLUDERNS': 93.0, 'SCHNALS': 57.0, 'STILFS': 103.0, 'TAUFERS I. M.': 75.0}
cv_dic = {1: 81.0, 2: 40.0, 3: 94.0, 4: 79.0, 5: 95.0, 6: 53.0,
        7: 108.0, 8: 101.0, 9: 69.0, 10: 93.0, 11: 57.0, 12: 103.0, 13: 75.0}
# Add mapping ID from shapefile to be able to join with shapefile
# df['ID'] = [cv_dic_1[i] for i in df['x0_residp']]
if 'x0_residp' in df:
    df['ID'] = [cv_dic[int(i)] for i in df['x0_residp']]


# Generations on setup
# Split categorical and non categorical variables and return them
def get_cat_ncat_vars(desc_dic):
    cdic = [[], []]
    cdicdesc = [[], []]
    for i in desc_dic.items():
        if type(i[1]) != str and type(i[1][1]) == dict:
            cdic[0].append(i[0])
            cdicdesc[0].append(i[1][0])
        else:
            cdic[1].append(i[0])
            cdicdesc[1].append(i[1])
    return [cdic, cdicdesc]


# Generate options depending on variable types (categorical, ordered)
splvars = get_cat_ncat_vars(description_unit_dic)

optsc = []
for indx, i in enumerate(splvars[0][0]):
    optsc.append({'label': splvars[1][0][indx], 'value': i})

optsnc = []
for indx, i in enumerate(splvars[0][1]):
    optsnc.append({'label': splvars[1][1][indx], 'value': i})

# use optsall + optsnc for new list
optsall = []
optsall.extend(optsc)
optsall.extend(optsnc)

#Create Flask app
app = Flask(__name__)
#app.secret_key = b'BR2pmSf#W8m$&SxSbz8dw3TceYhxF^'
# Check Configuration section for more details

app.config.from_object(__name__)
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=5)
sess = Session()
sess.init_app(app)

# Get all variable options
@app.route('/api/dropdown-all-options', methods=['GET'])
def get_dropdown_all_options():
    global optsall
    return {'options': optsall}

# Get categorical variable options
@app.route('/api/dropdown-categorical-options', methods=['GET'])
def get_dropdown_categorical_options():
    global optsc
    return {'options': optsc}

# Get non categorical variable options
@app.route('/api/dropdown-non-categorical-options', methods=['GET'])
def get_dropdown_non_categorical_options():
    global optsnc
    return {'options': optsnc}

# Get violin plot
@app.route('/api/violinplot', methods=['POST'])
def get_violin_plot():
    global df, description_unit_dic
    sdic = json.loads(request.data)
    value = sdic['value'] if 'value' in sdic else None
    colour = sdic['colour'] if 'colour' in sdic else None
    f_value = sdic['f_value'] if 'f_value' in sdic else None
    fa_col = sdic['fa_col'] if 'fa_col' in sdic else None
    fa_row = sdic['fa_row'] if 'fa_row' in sdic else None
    an_value = sdic['animation_variable'] if 'animation_variable' in sdic else None
    uid = sdic['uid'] if 'uid' in sdic else None
    path = sdic['path'] if 'path' in sdic else None

    if value and len(value) > 0:
        dff = df.query(f_value) if f_value else df.copy()
        dff = dff.sort_values(by=[an_value]) if an_value else dff
        if fa_col in dff and fa_col:
            dff[fa_col] = dff[fa_col].astype('str').replace(
                description_unit_dic[fa_col][1])
        if fa_row in dff and fa_row:
            dff[fa_row] = dff[fa_row].astype('str').replace(
                description_unit_dic[fa_row][1])
        # Create violin plot
        fig = px.violin(dff, y=value,  box=True, facet_col=fa_col, facet_row=fa_row
                        , animation_frame=an_value
                        , color=colour
                        #,points='all'
                        )
        # fig.update_layout(title={'text':'Violin Plot'})
        # fig.update_xaxes(scaleanchor = "y", scaleratio = 1)
        fig.update_layout(paper_bgcolor='white', plot_bgcolor='white')
        fig.update_xaxes(showgrid=True, gridcolor='LightGray')
        fig.update_yaxes(showgrid=True, gridcolor='LightGray')
        # Add violin plot info to session
        if uid and path:
            td = {}
            if value:
                td['value'] = value
            if colour:
                td['colour'] = colour
            if f_value:
                td['f_value'] = f_value
            if fa_col:
                td['fa_col'] = fa_col
            if fa_row:
                td['fa_row'] = fa_row
            if an_value:
                td['an_value'] = an_value
            if path[1:] not in session:
                session[path[1:]] = {}
            session[path[1:]]['violin-plot-'+str(uid)] = td

        return {'figure': plt.io.to_json(fig)}
    else:
        return {}

# Get bar plot
@app.route('/api/barplot', methods=['POST'])
def get_bar_plot():
    # todo improvement
    global df, description_unit_dic
    sdic = json.loads(request.data)
    x_value = sdic['x_value'] if 'x_value' in sdic else None
    y_value = sdic['y_value'] if 'y_value' in sdic else None
    colour = sdic['colour'] if 'colour' in sdic else None
    f_value = sdic['f_value'] if 'f_value' in sdic else None
    fa_col = sdic['fa_col'] if 'fa_col' in sdic else None
    fa_row = sdic['fa_row'] if 'fa_row' in sdic else None
    an_value = sdic['animation_variable'] if 'animation_variable' in sdic else None
    uid = sdic['uid'] if 'uid' in sdic else None
    path = sdic['path'] if 'path' in sdic else None

    if x_value or y_value:

        dff = df.query(f_value) if f_value else df.copy()

        if fa_col in dff and fa_col:
            dff[fa_col] = dff[fa_col].astype('str').replace(
                description_unit_dic[fa_col][1])
        if fa_row in dff and fa_row:
            dff[fa_row] = dff[fa_row].astype('str').replace(
                description_unit_dic[fa_row][1])

        # Create bar plot (improve todo)
        fig = None
        if x_value and y_value:
            #dff = dff[(dff[y_value].gt(-1))]

            sc = type(description_unit_dic[y_value][1]) == dict
            if sc:
                dff[y_value] = dff[y_value].astype('str').replace(
                    description_unit_dic[y_value][1])
            sc = type(description_unit_dic[x_value][1]) == dict
            if sc:
                dff[x_value] = dff[x_value].astype('str').replace(
                    description_unit_dic[x_value][1])

            if an_value:
                if colour:
                    dff[colour] = dff[colour].astype('str').replace(
                        description_unit_dic[colour][1])

                dfc = None
                grpvar = [x_value]
                grpvar.append(fa_row) if fa_row else grpvar
                grpvar.append(fa_col) if fa_col else grpvar
                grpvar.append(an_value) if an_value else grpvar

                # Calculate max y value
                dfc = math.ceil(dff.groupby(grpvar).sum().reset_index()[y_value].max())

                dff = dff.sort_values(by=[an_value, x_value])
                fig = px.bar(dff, x=x_value, y=y_value, color=colour, facet_row=fa_row, facet_col=fa_col
                            , range_y=[0, dfc], animation_frame=an_value
                            )
            else:
                if colour:
                    dff[colour] = dff[colour].astype('str').replace(
                        description_unit_dic[colour][1])

                fig = px.bar(dff, x=x_value, y=y_value, color=colour, facet_row=fa_row, facet_col=fa_col, labels={y_value: 'sum('+y_value+')'}
                            )

        elif x_value:
            #dff = dff[(dff[x_value].gt(-1))]

            sc = type(description_unit_dic[x_value][1]) == dict
            if sc:
                dff[x_value] = dff[x_value].astype('str').replace(
                    description_unit_dic[x_value][1])

            dfc = None
            grpvar = [x_value]
            grpvar.append(fa_row) if fa_row else grpvar
            grpvar.append(fa_col) if fa_col else grpvar
            grpvar.append(colour) if colour else grpvar
            grpvar.append(an_value) if an_value else grpvar
            dfc = dff.groupby(grpvar).size().reset_index(
                name='count('+str(x_value if not colour else colour)+')')
            dfrc = dfc['count('+str(x_value if not colour else colour)+')'].max()
            if colour:
                dfc[colour] = dfc[colour].astype('str').replace(
                    description_unit_dic[colour][1])
                grpvar.remove(colour)
                dfrc = dfc.groupby(grpvar).sum()[
                    'count('+str(x_value if not colour else colour)+')'].max()
            if an_value:
                dfc = dfc.sort_values(by=[an_value, x_value])
                fig = px.bar(dfc, x=x_value, y='count('+str(x_value if not colour else colour)+')', color=colour, facet_row=fa_row, facet_col=fa_col, range_y=[0, dfrc], animation_frame=an_value
                            )
            else:
                fig = px.bar(dfc, x=x_value, y='count('+str(x_value if not colour else colour)+')', color=colour, facet_row=fa_row, facet_col=fa_col
                            )

        if fig:
            fig.update_layout(paper_bgcolor='white', plot_bgcolor='white')
            fig.update_xaxes(showgrid=True, gridcolor='LightGray')
            fig.update_yaxes(showgrid=True, gridcolor='LightGray')

            # Add bar plot info to session
            if uid and path:
                td = {}
                if x_value:
                    td['x_value'] = x_value
                if y_value:
                    td['y_value'] = y_value
                if colour:
                    td['colour'] = colour
                if f_value:
                    td['f_value'] = f_value
                if fa_col:
                    td['fa_col'] = fa_col
                if fa_row:
                    td['fa_row'] = fa_row
                if an_value:
                    td['an_value'] = an_value
                if path[1:] not in session:
                    session[path[1:]] = {}
                session[path[1:]]['bar-plot-'+str(uid)] = td

            return {'figure': plt.io.to_json(fig)}
        else:
            return {}
    else:
        return {}

# Get bar-pyramid plot
@app.route('/api/barpyramidplot', methods=['POST'])
def get_bar_pyramid_plot():
    global df, description_unit_dic
    sdic = json.loads(request.data)
    x_value = sdic['x_value'] if 'x_value' in sdic else None
    y_value = sdic['y_value'] if 'y_value' in sdic else None
    bi_value = sdic['bi_value'] if 'bi_value' in sdic else None
    bins = int(sdic['bins']) if 'bins' in sdic and len(sdic['bins']) > 0 else None
    method = sdic['method'] if 'method' in sdic else None
    f_value = sdic['f_value'] if 'f_value' in sdic else None
    uid = sdic['uid'] if 'uid' in sdic else None
    path = sdic['path'] if 'path' in sdic else None

    if x_value and y_value and bi_value:
        if (type(description_unit_dic[bi_value][1]) == dict and
                len(description_unit_dic[bi_value][1].keys()) > 1):
            dff = df.query(f_value) if f_value else df.copy()

            dc = description_unit_dic[bi_value][1]
            keys = list(description_unit_dic[bi_value][1].keys())

            fig = make_subplots(rows=1, cols=2, specs=[[{'type': 'xy'}, {'type': 'xy'}]], shared_yaxes=True, horizontal_spacing=0.0, x_title=(
                method if method else 'count')+'('+x_value+')', y_title=y_value)

            df1 = dff.query(bi_value+' == '+keys[0])
            df2 = dff.query(bi_value+' == '+keys[1])

            # Add traces
            fig.add_trace(go.Histogram(
                y=df1[y_value],
                x=df1[x_value],
                name=dc[keys[0]],
                hoverinfo='x',
                nbinsy=bins,
                orientation='h',
                histfunc=method
            ), row=1, col=1)

            fig.add_trace(go.Histogram(
                y=df2[y_value],
                x=df2[x_value],
                name=dc[keys[1]],
                hoverinfo='x',
                nbinsy=bins,
                orientation='h',
                histfunc=method
            ), row=1, col=2)

            # Update xaxis
            fig.update_xaxes(row=1, col=1, autorange='reversed')

            fig.update_layout(paper_bgcolor='white', plot_bgcolor='white')
            fig.update_xaxes(showgrid=True, gridcolor='LightGray')
            fig.update_yaxes(showgrid=True, gridcolor='LightGray')
            # Add bar plot info to session
            if uid and path:
                td = {}
                if x_value:
                    td['x_value'] = x_value
                if y_value:
                    td['y_value'] = y_value
                if bi_value:
                    td['bi_value'] = bi_value
                if f_value:
                    td['f_value'] = f_value
                if bins:
                    td['bins'] = bins
                if method:
                    td['method'] = method
                if path[1:] not in session:
                    session[path[1:]] = {}
                session[path[1:]]['bar-pyramid-plot-'+str(uid)] = td

            return {'figure': plt.io.to_json(fig)}
        else:
            return {'figure': '{}'}
    else:
        return {}

# Get choropleth map
@app.route('/api/choroplethmap', methods=['POST'])
def get_choropleth_map():
    global df
    sdic = json.loads(request.data)
    value = sdic['value'] if 'value' in sdic else None
    m_value = sdic['method'] if 'method' in sdic else None
    f_value = sdic['f_value'] if 'f_value' in sdic else None
    an_value = sdic['animation_variable'] if 'animation_variable' in sdic else None
    uid = sdic['uid'] if 'uid' in sdic else None
    path = sdic['path'] if 'path' in sdic else None

    if value:
        dff = df.query(f_value) if f_value else df.copy()
        # Filter negative values (maybe should be done in preprocessing step )
        #dff = dff[(dff[value].gt(-1))]

        center = None
        if 'lat' in dff and 'lon' in dff:
            center = {"lat":round(dff['lat'].mean(), 4), "lon":round(dff['lon'].mean(), 4)}

        df_merged = None
        if an_value:
            dff = dff.groupby(['ID', an_value]).agg(m_value).reset_index()
            dff['ID'] = dff['ID'].astype('str')
            dff[value] = dff[value].round(2)
            df_merged = pd.merge(geod[['ID', 'NAME_DE']], dff[[
                                'ID', value, an_value]], left_on='ID', right_on='ID', how='left')
            df_merged = df_merged.dropna(subset=[value, 'NAME_DE'])
            df_merged[an_value] = df_merged[an_value].astype('int64')
        else:
            dff = dff.groupby(['ID']).agg(m_value).reset_index()
            dff['ID'] = dff['ID'].astype('str')
            dff[value] = dff[value].round(2)
            df_merged = pd.merge(geod[['ID', 'NAME_DE']], dff[[
                                'ID', value]], left_on='ID', right_on='ID', how='left')
            df_merged = df_merged.dropna(subset=[value, 'NAME_DE'])

        # convert the coordinate reference system to lat/long and convert to geojson
        vcs_json = geod.copy().to_crs(epsg=4326).__geo_interface__

        # Start of plot/html/visual part
        fig = px.choropleth_mapbox(df_merged, geojson=vcs_json, locations='ID', featureidkey='properties.ID', color=value                # , color_continuous_scale=colorcet.CET_CBC2
                                , hover_data={'NAME_DE': True, 'ID': False}, mapbox_style="open-street-map"
                                , center=center
                                , zoom=9, opacity=0.7
                                , range_color=[df_merged[value].min(), df_merged[value].max()]
                                , labels={value: str(m_value)+' '+str(value), 'NAME_DE': 'Municipal'}
                                , animation_frame=an_value
                                )
        # Add choropleth map info to session
        if uid and path:
            td = {}
            if value:
                td['value'] = value
            if m_value:
                td['m_value'] = m_value
            if f_value:
                td['f_value'] = f_value
            if an_value:
                td['an_value'] = an_value
            if path[1:] not in session:
                session[path[1:]] = {}
            session[path[1:]]['choropleth-map-'+str(uid)] = td

        return {"figure": plt.io.to_json(fig)}
    else:
        return {}

# Get confidence interval
@app.route('/api/confidenceinterval', methods=['POST'])
def get_confidence_interval():
    global df
    sdic = json.loads(request.data)
    value = sdic['value'] if 'value' in sdic else None
    ci_value = int(sdic['ci_value']) if 'ci_value' else None
    f_value = sdic['f_value'] if 'f_value' in sdic else None
    uid = sdic['uid'] if 'uid' in sdic else None
    path = sdic['path'] if 'path' in sdic else None

    if value and ci_value:
        dff = df.query(f_value) if f_value else df.copy()

        a = np.array(dff[value])
        n = len(a)
        m, se = np.mean(a), scipy.stats.sem(a)
        h = se * scipy.stats.t.ppf((1 + (ci_value/100.0)) / 2., n-1)

        #Create a figure
        fig = go.Figure(data=[go.Table(
                header=dict(values=['mean', 'count', 'sem'
                    , str(ci_value)+'% c.i. lower bound'
                    , str(ci_value)+'% c.i. upper bound']),
                cells=dict(values=[[str(m.round(2))], [str(n)]
                    , [str(se.round(2))], [str(round(m-h, 2))]
                    , [str(round(m+h, 2))]]
                ))])
        
        # Add confidence interval info to session
        if uid and path:
            td = {}
            if value:
                td['value'] = value
            if ci_value:
                td['ci_value'] = ci_value
            if f_value:
                td['f_value'] = f_value
            if path[1:] not in session:
                session[path[1:]] = {}
            session[path[1:]]['confidence-interval-'+str(uid)] = td

        return {"figure": plt.io.to_json(fig)}
        #{"figure": {"mean": str(m.round(2)), "count": str(n), "sem": str(se.round(2)), "lb": str(round(m-h, 2)), "up": str(round(m+h, 2))}}
    else:
        return {}

# Get correlation plot
@app.route('/api/correaltionplot', methods=['POST'])
def get_correlation_plot():
    global df
    sdic = json.loads(request.data)
    value = sdic['value'] if 'value' in sdic else None
    m_value = sdic['method'] if 'method' in sdic else None
    uid = sdic['uid'] if 'uid' in sdic else None
    path = sdic['path'] if 'path' in sdic else None

    if value and len(value) > 0 and m_value:
        dfc = df[value].corr(method=m_value)
        fig = ff.create_annotated_heatmap(z=dfc.values.round(
            2)[::-1], x=dfc.columns.tolist(), y=dfc.index.tolist()[::-1])
        fig.update_layout(paper_bgcolor='white', plot_bgcolor='white')
        fig.update_xaxes(showgrid=True, gridcolor='LightGray')
        fig.update_yaxes(showgrid=True, gridcolor='LightGray')

        # Add correlation plot info to session
        if uid and path:
            td = {}
            if value:
                td['value'] = value
            if m_value:
                td['m_value'] = m_value
            if path[1:] not in session:
                session[path[1:]] = {}
            session[path[1:]]['correlation-plot-'+str(uid)] = td

        return {"figure": plt.io.to_json(fig)}
    else:
        return {}

# Get histogram plot
@app.route('/api/histogramplot', methods=['POST'])
def get_histogram_plot():
    # todo how to fix y-axis for each
    global df, description_unit_dic
    sdic = json.loads(request.data)
    value = sdic['value'] if 'value' in sdic else None
    colour = sdic['colour'] if 'colour' in sdic else None
    f_value = sdic['f_value'] if 'f_value' in sdic else None
    fa_col = sdic['fa_col'] if 'fa_col' in sdic else None
    fa_row = sdic['fa_row'] if 'fa_row' in sdic else None
    an_value = sdic['animation_variable'] if 'animation_variable' in sdic else None
    # uid = sdic['uid'] if 'uid' in sdic else None
    # path = sdic['path'] if 'path' in sdic else None

    if value is not None and len(value) > 0:
        dff = df.query(f_value) if f_value else df.copy()
        #dff = dff[(dff[value].gt(-1))]

        if fa_col in dff and fa_col:
            dff[fa_col] = dff[fa_col].astype('str').replace(
                description_unit_dic[fa_col][1])
        if fa_row in dff and fa_row:
            dff[fa_row] = dff[fa_row].astype('str').replace(
                description_unit_dic[fa_row][1])
        if colour in dff and colour:
            dff[colour] = dff[colour].astype('str').replace(
                description_unit_dic[colour][1])

        sc = type(description_unit_dic[value][1]) == dict
        if sc:
            dff[value] = dff[value].astype('str').replace(
                description_unit_dic[value][1])

        fig = None

        # dfc = None
        # grpvar = [value]
        # grpvar.append(fa_row) if fa_row else grpvar
        # grpvar.append(fa_col) if fa_col else grpvar
        # grpvar.append(colour) if colour else grpvar
        # grpvar.append(an_value) if an_value else grpvar
        # dfc = dff.groupby(grpvar).size().reset_index(name='count('+str(value if not colour else colour)+')')
        # dfrc = dfc['count('+str(value if not colour else colour)+')'].max()
        # if colour:
        #     dfc[colour] = dfc[colour].astype('str').replace(description_unit_dic[colour][1])
        #     grpvar.remove(colour)
        #     dfrc = dfc.groupby(grpvar).sum()
        if an_value:
            # dfc = dfc.sort_values(by=[an_value, value])
            # grp = dff[[an_value, value]].groupby(an_value)
            # bins = (grp[value].max()-grp[value].min()).div(((grp[value].quantile(.75) -
            #             grp[value].quantile(.25)).div(grp[value].size().pow((1/3.0)))).mul(2.0))

            # sliders_dict = {"active":0,"currentvalue":{"prefix":an_value+"="}
            #   ,"len":0.9,"pad":{"b":10,"t":60}, 'steps':[]
            #   ,"x":0.1,"xanchor":"left","y":0,"yanchor":"top"}
            # frames = []
            # max_y = 0

            # for i in bins.reset_index().iterrows():
            #     c, d = np.histogram(dff[dff[an_value] == round(
            #         i[1][0])][value], bins=round(i[1][1]))
            #     frame = {"data": [], "name": str(round(i[1][0]))}
            #     #if fig:
            #     mc = np.max(c)
            #     frame['data'] = px.histogram(
            #         dff[dff[an_value] == round(i[1][0])].sort_values(by=[an_value, value])
            #             , x=value, color=colour, facet_col=fa_col, facet_row=fa_row
            #             , nbins=round(i[1][1])
            #             #, range_y=[0, mc]
            #     ).data
            #     max_y = mc if mc > max_y else max_y
            #     frames.append(frame)
                    #fig['frames'].append(frame)
                # else:
                #     fig = px.histogram(dff[dff[an_value] == round(i[1][0])].sort_values(by=[an_value, value])
                #             , x=value, color=colour, facet_col=fa_col, facet_row=fa_row, nbins=round(i[1][1])                        # , animation_frame=an_value
                #             , range_y=[0, np.max(c)])
                #     fig.update_layout(paper_bgcolor='white',
                #                       plot_bgcolor='white')
                #     fig.update_xaxes(showgrid=True, gridcolor='LightGray')
                #     fig.update_yaxes(showgrid=True, gridcolor='LightGray')
                #     fig = json.loads(plt.io.to_json(fig))
                #     fig["frames"] = []
                #     frame["data"] = fig['data']
                #     fig["frames"].append(frame)
                #     fig['layout']["updatemenus"] = [{"buttons": [{"args": [[None]
                #         , {"frame": {"duration": 500, "redraw": True}, "fromcurrent": True
                #         , "mode": "immediate", "transition": {"duration": 500, "easing": "linear"}}]
                #         , "label": "&#9654;", "method": "animate"}, {"args": [[None], {"frame": {
                #         "duration": 0, "redraw": True}, "fromcurrent": True, "mode": "immediate"
                #         , "transition": {"duration": 0, "easing": "linear"}}], "label": "&#9724;"
                #         , "method": "animate"}], "direction": "left", "pad": {"r": 10, "t": 70}
                #         , "showactive": False, "type": "buttons", "x": 0.1, "xanchor": "right"
                #         , "y": 0, "yanchor": "top"}]
                
            #     slider_step = {"args": [
            #                     [str(round(i[1][0]))],
            #                         {"frame": {"duration": 0, "redraw": True},
            #                         "fromcurrent":True,
            #                         "mode": "immediate",
            #                         "transition": {"duration":0,"easing":"linear"}}
            #                     ],
            #                         "label": str(round(i[1][0])),
            #                         "method": "animate"}
            #     sliders_dict["steps"].append(slider_step)

            # fig["layout"]["sliders"] = [sliders_dict]

            fig = px.histogram(dff.sort_values(by=[an_value, value]), x=value, color=colour, facet_col=fa_col, facet_row=fa_row
                        , animation_frame=an_value
                        # , nbins=20
                        # , range_y=[0, dfrc['count('+str(value if not colour else colour)+')'].max()]
                        , range_y = [0, 300]#max_y
                        )
            fig.update_layout(paper_bgcolor='white', plot_bgcolor='white')
            fig.update_xaxes(showgrid=True, gridcolor='LightGray')
            fig.update_yaxes(showgrid=True, gridcolor='LightGray')

            fig_d = fig.to_dict()
            max_y = 0
            for i in fig_d['frames']:
                unique, frequency = np.unique(i['data'][0]['x'], 
                            return_counts = True)
                cmax = np.max(frequency)
                max_y = cmax if cmax > max_y else max_y
            
            print(max_y)
            #print(fig_d['frames'])
            #fig.update({'frames':frames}, True)
            print(plt.io.to_json(fig))
        else:
            cbins = None
            if not sc and dff[value].dtypes != 'O':
                # Use Freedman-Diaconis rule to calculate bins
                q3, q1 = np.nanpercentile(dff[value], [75, 25])
                iqr = q3 - q1
                h = 2*(iqr/(len(dff.index)**(1/3.0)))
                range_d = abs(dff[value].max()-dff[value].min())
                cbins = round(range_d/h)
            fig = px.histogram(dff, x=value, color=colour,
                            facet_col=fa_col, facet_row=fa_row, nbins=cbins)

            fig.update_layout(paper_bgcolor='white', plot_bgcolor='white')
            fig.update_xaxes(showgrid=True, gridcolor='LightGray')
            fig.update_yaxes(showgrid=True, gridcolor='LightGray')
            # print(plt.io.to_json(fig))
        return {"figure": plt.io.to_json(fig)}
    else:
        return {}

# Get line plot
@ app.route('/api/lineplot', methods=['POST'])
def get_line_plot():
    global df, description_unit_dic
    sdic = json.loads(request.data)
    x_value = sdic['x_value'] if 'x_value' in sdic else None
    y_value = sdic['y_value'] if 'y_value' in sdic else None
    fa_col = sdic['fa_col'] if 'fa_col' in sdic else None
    fa_row = sdic['fa_row'] if 'fa_row' in sdic else None
    f_value = sdic['f_value'] if 'f_value' in sdic else None
    an_value = sdic['animation_variable'] if 'animation_variable' in sdic else None
    uid = sdic['uid'] if 'uid' in sdic else None
    path = sdic['path'] if 'path' in sdic else None

    if x_value and y_value:
        dff = df.query(f_value) if f_value else df.copy()
        grpa = [x_value]  # , y_value
        if fa_col and fa_col in dff:
            grpa.append(fa_col)
        if fa_row and fa_row in dff:
            grpa.append(fa_row)
        if an_value and an_value in dff:
            grpa.append(an_value)

        df1 = dff.groupby(grpa).agg('mean').reset_index()
        if fa_col in df1 and fa_col:
            df1[fa_col] = df1[fa_col].astype('str').replace(
                description_unit_dic[fa_col][1])
        if fa_row in df1 and fa_row:
            df1[fa_row] = df1[fa_row].astype('str').replace(
                description_unit_dic[fa_row][1])

        if x_value in df1 and y_value in df1:
            df1 = df1.sort_values(by=[an_value, x_value]) if an_value else df1
            # Create line plot
            fig = px.line(df1, x=x_value, y=y_value, facet_row=fa_row, facet_col=fa_col
                            , animation_frame=an_value
                            , range_y=[math.floor(df1[y_value].min())
                                , math.ceil(df1[y_value].max())]
                        # , error_x=[dff[x_value].sem() for i in range(len(dff))] if x_value else None
                        # , error_y=[dff[y_value].sem() for i in range(len(dff))] if y_value else None
                        )
            # fig.update_xaxes(scaleanchor = "y", scaleratio = 1)
            fig.update_layout(paper_bgcolor='white', plot_bgcolor='white')
            fig.update_xaxes(showgrid=True, gridcolor='LightGray')
            fig.update_yaxes(showgrid=True, gridcolor='LightGray',
                            title_text='mean('+y_value+')')

            # Add line plot info to session
            if uid and path:
                td = {}
                if x_value:
                    td['x_value'] = x_value
                if y_value:
                    td['y_value'] = y_value
                if f_value:
                    td['f_value'] = f_value
                if fa_col:
                    td['fa_col'] = fa_col
                if fa_row:
                    td['fa_row'] = fa_row
                if an_value:
                    td['an_value'] = an_value
                if path[1:] not in session:
                    session[path[1:]] = {}
                session[path[1:]]['line-plot-'+str(uid)] = td
            return {"figure": plt.io.to_json(fig)}
        else:
            return {}
    else:
        return {}

# Get scatter map
@ app.route('/api/scattermap', methods=['POST'])
def get_scatter_map():
    global df, geod, description_unit_dic
    sdic = json.loads(request.data)
    value = sdic['value'] if 'value' in sdic else None
    f_value = sdic['f_value'] if 'f_value' in sdic else None
    an_value = sdic['animation_variable'] if 'animation_variable' in sdic else None
    uid = sdic['uid'] if 'uid' in sdic else None
    path = sdic['path'] if 'path' in sdic else None

    if value:
        dff = df.query(f_value) if f_value else df.copy()
        dff = dff.sort_values(by=[an_value]) if an_value else dff
        if len(dff.index) > 0:
            c_scale = colorcet.CET_CBC2
            sc = type(description_unit_dic[value][1]) == dict
            if sc:
                c_scale = colorcet.glasbey_dark

            center = None
            if 'lat' in dff and 'lon' in dff:
                center = {"lat":round(dff['lat'].mean(), 4), "lon":round(dff['lon'].mean(), 4)}
            fig = None
            if sc:
                fig = px.scatter_mapbox(dff, lat='lat', lon='lon', color=dff[value].astype('str').replace(description_unit_dic[value][1])                    # astype('category')
                                        , zoom=9, center=center
                                        , mapbox_style="open-street-map"
                                        , color_discrete_sequence=c_scale
                                        , range_color=[dff[value].min(), dff[value].max()]
                                        , animation_frame=an_value
                                        , opacity=0.7
                                        )
            else:
                fig = px.scatter_mapbox(dff, lat='lat', lon='lon', color=value
                                        , zoom=9, center=center
                                        , mapbox_style="open-street-map"
                                        #, color_continuous_scale=c_scale
                                        , range_color=[dff[value].min(), dff[value].max()]
                                        , animation_frame=an_value
                                        , opacity=0.7
                                        )

            # Add municipality  regions
            vcs_json = geod.to_crs(epsg=4326).__geo_interface__
            fig.update_layout(
                mapbox_layers=[
                    {
                        'sourcetype': 'geojson',
                        'source': vcs_json,
                        'type': 'line',
                        'below': 'traces',
                        # 'opacity':0.7,
                        'color': 'black'
                    }
                ]
            )
        # Add scatter map info to session
        if uid and path:
            td = {}
            if value:
                td['value'] = value
            if f_value:
                td['f_value'] = f_value
            if an_value:
                td['an_value'] = an_value
            if path[1:] not in session:
                session[path[1:]] = {}
            session[path[1:]]['scatter-map-'+str(uid)] = td

        return {"figure": plt.io.to_json(fig)}
    else:
        return {}

# Get scatter map for home view
@ app.route('/api/homeviewscattermap', methods=['GET'])
def get_home_view_scatter_map():
    global df

    if df is not None and len(df.index) > 0:
        center = None
        if 'lat' in df and 'lon' in df:
            center = {"lat":round(df['lat'].mean(), 4), "lon":round(df['lon'].mean(), 4)}
        fig = px.scatter_mapbox(df.sort_values(by=['x0_examy']), lat='lat', lon='lon', zoom=8, center=center, mapbox_style="open-street-map", animation_frame='x0_examy', height=600
                                )
        fig.update_layout({'autosize': True})
        return {"figure": plt.io.to_json(fig)}
    else:
        return {}

# Get dataframe info
@ app.route('/api/homeviewdfinfo', methods=['GET'])
def get_home_view_df_info():
    nr = len(df)
    nc = len(df.columns)
    mv = df.isin([-89, np.nan, 'nan']).sum().sum()
    pmv = round(mv/((nr*nc)/100.0), 2)
    c1l = [['Number of rows', '{:,}'.format(nr).replace(',', '.')], ['Number of columns (variables)', '{:,}'.format(nc).replace(',', '.')], ['Number of values', '{:,}'.format(
        nr*nc).replace(',', '.')], ['Number of missing values', '{:,}'.format(mv).replace(',', '.')], ['% of missing values', '{:.2f}%'.format(pmv).replace('.', ',')]]

    return {'c1l': c1l}

# Get Hexbin map
@ app.route('/api/hexbinmap', methods=['POST'])
def get_hexbin_map():
    global df, geod, description_unit_dic
    sdic = json.loads(request.data)
    value = sdic['value'] if 'value' in sdic else None
    m_value = sdic['method'] if 'method' in sdic else None
    nr_hexs = int(sdic['nr_hexs']) if 'nr_hexs' in sdic and len(sdic['nr_hexs']) > 0 else None
    f_value = sdic['f_value'] if 'f_value' in sdic else None
    an_value = sdic['animation_variable'] if 'animation_variable' in sdic else None
    uid = sdic['uid'] if 'uid' in sdic else None
    path = sdic['path'] if 'path' in sdic else None

    if value:
        dff = df.query(f_value) if f_value else df.copy()
        # Filter negative values (maybe should be done in preprocessing step )
        #dff = dff[(dff[value].gt(-1))]

        agf = None
        if m_value:
            if m_value == 'mean':
                agf = np.average
            elif m_value == 'median':
                agf = np.median

        fig = ff.create_hexbin_mapbox(
            data_frame=dff, lat='lat', lon='lon', color=value,
            nx_hexagon=nr_hexs, min_count=1,
            mapbox_style='open-street-map',
            labels={'color':m_value+" "+value if m_value else "Count "+value},
            color_continuous_scale=colorcet.bmy,
            agg_func=agf, animation_frame=an_value
        )
        # Add hexbin map info to session
        if uid and path:
            td = {}
            if value:
                td['value'] = value
            if m_value:
                td['m_value'] = m_value
            if f_value:
                td['f_value'] = f_value
            if nr_hexs:
                td['nr_hexs'] = nr_hexs
            if an_value:
                td['an_value'] = an_value
            if path[1:] not in session:
                session[path[1:]] = {}
            session[path[1:]]['hexbin-map-'+str(uid)] = td

        return {"figure": plt.io.to_json(fig)}
    else:
        return {}

# Create clustering view
@ app.route('/api/clusteringview', methods=['POST'])
def get_clustering_view():
    global df, geod, description_unit_dic
    sdic = json.loads(request.data)
    value = sdic['value'] if 'value' in sdic else None
    min_value = int(sdic['min_value']) if 'min_value' in sdic else None
    min_samples_size = int(sdic['min_samples']) if 'min_samples' in sdic and len(sdic['min_samples']) > 0 else None
    f_value = sdic['f_value'] if 'f_value' in sdic else None
    uid = sdic['uid'] if 'uid' in sdic else None
    path = sdic['path'] if 'path' in sdic else None

    if value and len(value) > 0 and min_value:
        dff = df.query(f_value) if f_value else df.copy()
        #Cluster data
        #dff = dff[value]
        clusterer = hdbscan.HDBSCAN(min_cluster_size=min_value, min_samples=min_samples_size)
        #metric='mahalanobis'
        clusterer.fit(dff[value])

        # Create scatter matrix
        dff['clusters'] = clusterer.labels_
        #if 'clustering_colours' not in session:
        session['clustering_colours'] = clusterer.labels_.copy().astype('str')
        session['demographic_selection'] = clusterer.labels_.copy().astype('str')
        session['selection_count'] = 0
        colour_dic = {}
        for ind, i in enumerate(np.unique(clusterer.labels_)):
            colour_dic[i] = 'rgba'+str(ImageColor.getrgb(colorcet.glasbey_dark[ind]))[:-1]+', 1.0)'
        colour_dic[-1]='rgba(211,211,211, 0.45)'

        dff['clusters'] = dff['clusters'].astype('category')
        fig = px.scatter_matrix(dff
            , dimensions=value
            , color='clusters'
            #, color=dff['clusters'].astype('category')
            #, color_discrete_sequence=colorcet.glasbey_dark
            , color_discrete_map=colour_dic
        )
        center = None
        if 'lat' in dff and 'lon' in dff:
            center = {"lat":round(dff['lat'].mean(), 4), "lon":round(dff['lon'].mean(), 4)}
        # Create scatter map
        fig_geo = px.scatter_mapbox(dff, lat='lat', lon='lon', color='clusters', zoom=9
                    , center=center
                    , mapbox_style="open-street-map"
                    # , color_discrete_sequence=colorcet.glasbey_dark
                    #, color_continuous_scale=colorcet.glasbey_dark
                    , range_color=[dff[value].min(), dff[value].max()]
                    , color_discrete_map=colour_dic
                    , custom_data=[dff.index.to_numpy()])

        # Add municipality  regions
        vcs_json = geod.to_crs(epsg=4326).__geo_interface__
        fig_geo.update_layout(
            mapbox_layers=[
                {
                    'sourcetype': 'geojson',
                    'source': vcs_json,
                    'type': 'line',
                    'below': 'traces',
                    # 'opacity':0.7,
                    'color': 'black'
                }
            ]
        )

        fig.update_traces(diagonal_visible=False)
        fig.update_layout(paper_bgcolor='white', plot_bgcolor='white')
        fig.update_xaxes(showgrid=True, gridcolor='LightGray')
        fig.update_yaxes(showgrid=True, gridcolor='LightGray')
        # Add clustering view info to session
        if uid and path:
            td = {}
            if value:
                td['value'] = value
            if min_value:
                td['min_value'] = min_value
            if f_value:
                td['f_value'] = f_value
            if min_samples_size:
                td['min_samples_size'] = min_samples_size
            if path[1:] not in session:
                session[path[1:]] = {}
            session[path[1:]]['clustering-view'+str(uid)] = td

        return {"figure": plt.io.to_json(fig), "figure_geo": plt.io.to_json(fig_geo)}
    else:
        return {}

# Update colours for selection for clustering
@ app.route('/api/clusteringselectioncolourupdate', methods=['POST'])
def update_selection_colours():
    global df, geod, description_unit_dic
    sdic = json.loads(request.data)
    value = sdic['value'] if 'value' in sdic else None
    # min_value = int(sdic['min_value']) if 'min_value' in sdic else None
    # min_samples_size = int(sdic['min_samples']) if 'min_samples' in sdic else None
    f_value = sdic['f_value'] if 'f_value' in sdic else None
    selected_Points = sdic['sP'] if 'sP' in sdic else None
    # selection_count = sdic['selection_count'] if 'selection_count' in sdic else None

    if selected_Points :#and selection_count
        dff = df.query(f_value) if f_value else df.copy()
        session['selection_count'] = session['selection_count'] + 1
        sC = session['selection_count']
        for i in selected_Points:
            session['demographic_selection'][i] = 's'+str(sC)
        dff['clusters'] = session['demographic_selection']
        # Generate colours
        colour_dic = {}
        for ind, i in enumerate(np.unique(dff['clusters'])):
            colour_dic[i] = 'rgba'+str(ImageColor.getrgb(colorcet.glasbey_dark[ind]))[:-1]+', 1.0)'
        colour_dic['-1']= 'rgba(211,211,211, 0.45)'
        center = None
        if 'lat' in dff and 'lon' in dff:
            center = {"lat":round(dff['lat'].mean(), 4), "lon":round(dff['lon'].mean(), 4)}
        # Create scatter map
        fig_geo = px.scatter_mapbox(dff, lat='lat', lon='lon'
                    , color='clusters', zoom=9
                    , center=center
                    , mapbox_style="open-street-map"
                    # , color_discrete_sequence=colorcet.glasbey_dark
                    , range_color=[dff[value].min(), dff[value].max()]
                    , color_discrete_map=colour_dic#{-1:'rgba(211,211,211, 0.45)'}
                    , custom_data=[dff.index.to_numpy()])

        # Add municipality  regions
        vcs_json = geod.to_crs(epsg=4326).__geo_interface__
        fig_geo.update_layout(
            mapbox_layers=[
                {
                    'sourcetype': 'geojson',
                    'source': vcs_json,
                    'type': 'line',
                    'below': 'traces',
                    # 'opacity':0.7,
                    'color': 'black'
                }
            ]
        )

        # fig_geo.update_layout(legend_title='clusters & selections')
        return {"figure_geo": plt.io.to_json(fig_geo)}
    else:
        return {}

# Get selection comparison plot
@ app.route('/api/selectiongroupcompare', methods=['POST'])
def get_group_compare_plot():
    global df, description_unit_dic
    sdic = json.loads(request.data)
    ncv_values = sdic['ncv_values'] if 'ncv_values' in sdic else None
    cv_values = sdic['cv_values'] if 'cv_values' in sdic else None
    plot_type = sdic['plot_type'] if 'plot_type' in sdic else None
    # value = sdic['value'] if 'value' in sdic else None
    # colour = sdic['colour'] if 'colour' in sdic else None
    f_value = sdic['f_value'] if 'f_value' in sdic else None
    # fa_col = sdic['fa_col'] if 'fa_col' in sdic else None
    # fa_row = sdic['fa_row'] if 'fa_row' in sdic else None
    # an_value = sdic['animation_variable'] if 'animation_variable' in sdic else None

    dff = df.query(f_value) if f_value else df.copy()
    
    if plot_type == 'violin plot':

        if 'demographic_selection' in session and len(session['demographic_selection']) > 1:
            dff['clusters'] = session['demographic_selection']
            dff = dff[dff['clusters'].str.startswith('s', na=False)]
            fa_col = cv_values[0] if cv_values else None
            fa_row = cv_values[1] if cv_values and len(cv_values) > 1 else None
            # dff = dff.sort_values(by=[an_value]) if an_value else dff
            if fa_col in dff and fa_col:
                dff[fa_col] = dff[fa_col].astype('str').replace(
                    description_unit_dic[fa_col][1])
            if fa_row in dff and fa_row:
                dff[fa_row] = dff[fa_row].astype('str').replace(
                    description_unit_dic[fa_row][1])
            # Create violin plot
            fig = px.violin(dff, y=ncv_values[0],  box=True
                        , facet_col=fa_col, facet_row=fa_row
                        #, animation_frame=an_value
                        ,color='clusters')
            # fig.update_layout(title={'text':'Violin Plot'})
            # fig.update_xaxes(scaleanchor = "y", scaleratio = 1)
            fig.update_layout(paper_bgcolor='white', plot_bgcolor='white')
            fig.update_xaxes(showgrid=True, gridcolor='LightGray')
            fig.update_yaxes(showgrid=True, gridcolor='LightGray')
            return {'figure_comp': plt.io.to_json(fig)}
        else:
            return {}

    elif plot_type == 'bar plot':

        if 'demographic_selection' in session and len(session['demographic_selection']) > 1:
            dff['clusters'] = session['demographic_selection']
            dff = dff[dff['clusters'].str.startswith('s', na=False)]
            fa_col = cv_values[0] if cv_values else None
            fa_row = cv_values[1] if cv_values and len(cv_values) > 1 else None
            if fa_col in dff and fa_col:
                dff[fa_col] = dff[fa_col].astype('str').replace(
                    description_unit_dic[fa_col][1])
            if fa_row in dff and fa_row:
                dff[fa_row] = dff[fa_row].astype('str').replace(
                    description_unit_dic[fa_row][1])

            # Create bar plot (improve todo)
            fig = None
            x_value = ncv_values[0]
            colour = 'clusters'
            if len(ncv_values) > 1:
                y_value = ncv_values[1]
                dff = dff[(dff[y_value].gt(-1))]

                sc = type(description_unit_dic[y_value][1]) == dict
                if sc:
                    dff[y_value] = dff[y_value].astype('str').replace(
                        description_unit_dic[y_value][1])
                sc = type(description_unit_dic[x_value][1]) == dict
                if sc:
                    dff[x_value] = dff[x_value].astype('str').replace(
                        description_unit_dic[x_value][1])

                # if colour:
                #     dff[colour] = dff[colour].astype('str').replace(
                #         description_unit_dic[colour][1])

                fig = px.bar(dff, x=x_value, y=y_value, color=colour
                            , facet_row=fa_row, facet_col=fa_col
                            , labels={y_value: 'sum('+y_value+')'}
                            )

            elif len(ncv_values) == 1:
                dff = dff[(dff[x_value].gt(-1))]

                sc = type(description_unit_dic[x_value][1]) == dict
                if sc:
                    dff[x_value] = dff[x_value].astype('str').replace(
                        description_unit_dic[x_value][1])

                dfc = None
                grpvar = [x_value]
                grpvar.append(fa_row) if fa_row else grpvar
                grpvar.append(fa_col) if fa_col else grpvar
                grpvar.append(colour) if colour else grpvar
                #grpvar.append(an_value) if an_value else grpvar
                dfc = dff.groupby(grpvar).size().reset_index(
                    name='count('+str(x_value if not colour else colour)+')')
                dfrc = dfc['count('+str(x_value if not colour else colour)+')'].max()
                # if colour:
                #     dfc[colour] = dfc[colour].astype('str').replace(
                #         description_unit_dic[colour][1])
                #     grpvar.remove(colour)
                #     dfrc = dfc.groupby(grpvar).sum()[
                #         'count('+str(x_value if not colour else colour)+')'].max()
                
                fig = px.bar(dfc, x=x_value, y='count('+str(x_value if not colour else colour)+')'
                            , color=colour
                            , facet_row=fa_row, facet_col=fa_col
                            )

            if fig:
                fig.update_layout(paper_bgcolor='white', plot_bgcolor='white')
                fig.update_xaxes(showgrid=True, gridcolor='LightGray')
                fig.update_yaxes(showgrid=True, gridcolor='LightGray')
                return {'figure_comp': plt.io.to_json(fig)}
            else:
                return {}
        else:
            return {}

    elif plot_type == 'histogram plot':

        if 'demographic_selection' in session and len(session['demographic_selection']) > 1:
            value = ncv_values[0]
            colour = 'clusters'
            dff['clusters'] = session['demographic_selection']
            dff = dff[dff['clusters'].str.startswith('s', na=False)]
            dff = dff[(dff[value].gt(-1))]
            fa_col = cv_values[0] if cv_values else None
            fa_row = cv_values[1] if cv_values and len(cv_values) > 1 else None

            if fa_col in dff and fa_col:
                dff[fa_col] = dff[fa_col].astype('str').replace(
                    description_unit_dic[fa_col][1])
            if fa_row in dff and fa_row:
                dff[fa_row] = dff[fa_row].astype('str').replace(
                    description_unit_dic[fa_row][1])
            # if colour in dff and colour:
            #     dff[colour] = dff[colour].astype('str').replace(
            #         description_unit_dic[colour][1])

            sc = type(description_unit_dic[value][1]) == dict
            if sc:
                dff[value] = dff[value].astype('str').replace(
                    description_unit_dic[value][1])

            fig = None
            cbins = None
            if not sc:
                # Use Freedman-Diaconis rule to calculate bins
                q3, q1 = np.percentile(dff[value], [75, 25])
                iqr = q3 - q1
                h = 2*(iqr/(len(dff.index)**(1/3.0)))
                range_d = dff[value].max()-dff[value].min()
                cbins = round(range_d/h)
            fig = px.histogram(dff, x=value, color=colour,
                                facet_col=fa_col, facet_row=fa_row,
                                nbins=cbins
                                )

            fig.update_layout(paper_bgcolor='white', plot_bgcolor='white')
            fig.update_xaxes(showgrid=True, gridcolor='LightGray')
            fig.update_yaxes(showgrid=True, gridcolor='LightGray')
            
            return {"figure_comp": plt.io.to_json(fig)}
        else:
            return {}

    elif plot_type == 'line plot':

        if 'demographic_selection' in session and len(session['demographic_selection']) > 1:
            dff['clusters'] = session['demographic_selection']
            dff = dff[dff['clusters'].str.startswith('s', na=False)]
            x_value = ncv_values[0]
            y_value = ncv_values[1] if len(ncv_values) > 1 else None
            fa_col = cv_values[0] if cv_values else None
            fa_row = cv_values[1] if cv_values and len(cv_values) > 1 else None
            grpa = [x_value, 'clusters']  # , y_value
            if fa_col and fa_col in dff:
                grpa.append(fa_col)
            if fa_row and fa_row in dff:
                grpa.append(fa_row)
            # if an_value and an_value in dff:
            #     grpa.append(an_value)

            df1 = dff.groupby(grpa).agg('mean').reset_index()
            if fa_col in df1 and fa_col:
                df1[fa_col] = df1[fa_col].astype('str').replace(
                    description_unit_dic[fa_col][1])
            if fa_row in df1 and fa_row:
                df1[fa_row] = df1[fa_row].astype('str').replace(
                    description_unit_dic[fa_row][1])

            if x_value in df1 and y_value in df1 and x_value and y_value:
                #df1 = df1.sort_values(by=[an_value, x_value]) if an_value else df1
                # Create line plot
                fig = px.line(df1, x=x_value, y=y_value
                            , color = 'clusters'
                            , facet_row=fa_row, facet_col=fa_col
                            #, animation_frame=an_value
                            #, range_y=[df1[y_value].min(), df1[y_value].max()]
                            # , error_x=[dff[x_value].sem() for i in range(len(dff))] if x_value else None
                            # , error_y=[dff[y_value].sem() for i in range(len(dff))] if y_value else None
                            )
                # fig.update_xaxes(scaleanchor = "y", scaleratio = 1)
                fig.update_layout(paper_bgcolor='white', plot_bgcolor='white')
                fig.update_xaxes(showgrid=True, gridcolor='LightGray')
                fig.update_yaxes(showgrid=True, gridcolor='LightGray',
                                title_text='mean('+y_value+')')

                return {"figure_comp": plt.io.to_json(fig)}
            else:
                return {}
        else:
            return {}
    
    else:
        return {}

# Get the current analysis session info to save it
@ app.route('/api/saveSession', methods=['GET'])
def get_current_session_info():
    sdic = {}
    if 'IndividualView' in session:
        sdic['IndividualView'] = session['IndividualView']
    if 'ClusteringView' in session:
        sdic['ClusteringView'] = session['ClusteringView']
        sdic['clustering_colours'] = session['clustering_colours']
        sdic['demographic_selection'] = session['demographic_selection']
        sdic['selection_count'] = session['selection_count']
    
    if len(sdic.keys()) > 0:
        return json.dumps({'sdic': sdic})
    else:
        return {}

# Remove plot from session
@ app.route('/api/removeFromSession', methods=['POST'])
def remove_plot_from_Session():
    sdic = json.loads(request.data)
    uid = sdic['uid'] if 'uid' in sdic else None
    path = sdic['path'] if 'path' in sdic else None

    if uid and path:
        if path[1:] in session:
            if uid in session[path[1:]]:
                session[path[1:]].pop(uid)
        return {'msg':'Deletion successful'}
    else:
        return {'msg':'Not enough data'}

# Clear user session vars
@ app.route('/api/clearsessionforloadsession')
def clear_session_vars():
    if 'ClusteringView' in session:
        session.pop('ClusteringView')
    if 'clustering_colours' in session:
        session.pop('clustering_colours')
    if 'selection_count' in session:
        session.pop('selection_count')
    if 'demographic_selection' in session:
        session.pop('demographic_selection')
    if 'IndividualView' in session:
        session.pop('IndividualView')

    return {'msg':'Clearing successful'}