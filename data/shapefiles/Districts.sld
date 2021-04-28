<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" version="1.0.0">
  <NamedLayer>
    <Name>Districts</Name>
    <UserStyle>
      <Name>Districts</Name>
      <Title>Bezirksgemeinschaften - Comunità comprensoriali  
        <Localized lang="de">Bezirksgemeinschaften</Localized>
        <Localized lang="it">Comunità comprensoriali</Localized>
        </Title>
      <FeatureTypeStyle>
        <Rule>
          <Name>1</Name>
          <Title>Bezirksgemeinschaften - Comunità comprensoriali  
        <Localized lang="de">Bezirksgemeinschaften</Localized>
        <Localized lang="it">Comunità comprensoriali</Localized>
        </Title>
        <MinScaleDenominator>250000</MinScaleDenominator>
          <PolygonSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#FFFFFF</CssParameter>
              <CssParameter name="stroke-width">2.5</CssParameter>
			  <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
          <PolygonSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#000000</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
          <TextSymbolizer>
          <Geometry>
              <ogc:Function name="interiorPoint">
                <ogc:PropertyName>SHAPE</ogc:PropertyName>
              </ogc:Function>
            </Geometry>
            <Label>
              <ogc:PropertyName>MAP_LABEL</ogc:PropertyName>
            </Label>
            <Font>
              <CssParameter name="font-family">Open Sans</CssParameter>
              <CssParameter name="font-size">10</CssParameter>
              <CssParameter name="font-style">normal</CssParameter>
              <CssParameter name="font-weight">normal</CssParameter>
            </Font>
            <LabelPlacement>
              <PointPlacement>
                <AnchorPoint>
                  <AnchorPointX>0.5</AnchorPointX>
                  <AnchorPointY>0.5</AnchorPointY>
                </AnchorPoint>
              </PointPlacement>
            </LabelPlacement>
            <Halo>
              <Radius>
                <ogc:Literal>2</ogc:Literal>
              </Radius>
              <Fill>
                <CssParameter name="fill">#ffffff</CssParameter>
                <CssParameter name="fill-opacity">0.7</CssParameter>
              </Fill>
            </Halo>
            <Fill>
              <CssParameter name="fill">#000000</CssParameter>
              <CssParameter name="fill-opacity">1</CssParameter>
            </Fill>
            <!--      <VendorOption name="conflictResolution">false</VendorOption> -->
            <Priority>1</Priority>
            <!--      <VendorOption name="conflictResolution">false</VendorOption> -->
            <VendorOption name="conflictResolution">true</VendorOption>
            <VendorOption name="charSpacing">3</VendorOption>
          </TextSymbolizer>
        </Rule>
        <Rule>
          <Name>2</Name>
          <Title>Bezirksgemeinschaften - Comunità comprensoriali  
        <Localized lang="de">Bezirksgemeinschaften</Localized>
        <Localized lang="it">Comunità comprensoriali</Localized>
        </Title>
        <MaxScaleDenominator>250000</MaxScaleDenominator>
          <PolygonSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#FFFFFF</CssParameter>
              <CssParameter name="stroke-width">2.5</CssParameter>
			  <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
          <PolygonSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#000000</CssParameter>
              <CssParameter name="stroke-width">0.5</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
          <TextSymbolizer>
            <Label>
              <ogc:PropertyName>MAP_LABEL</ogc:PropertyName>
            </Label>
            <Font>
              <CssParameter name="font-family">Open Sans</CssParameter>
              <CssParameter name="font-size">10</CssParameter>
              <CssParameter name="font-style">normal</CssParameter>
              <CssParameter name="font-weight">normal</CssParameter>
            </Font>
            <LabelPlacement>
              <PointPlacement>
                <AnchorPoint>
                  <AnchorPointX>0.5</AnchorPointX>
                  <AnchorPointY>0.5</AnchorPointY>
                </AnchorPoint>
              </PointPlacement>
            </LabelPlacement>
            <Halo>
              <Radius>
                <ogc:Literal>2</ogc:Literal>
              </Radius>
              <Fill>
                <CssParameter name="fill">#ffffff</CssParameter>
                <CssParameter name="fill-opacity">0.7</CssParameter>
              </Fill>
            </Halo>
            <Fill>
              <CssParameter name="fill">#000000</CssParameter>
              <CssParameter name="fill-opacity">1</CssParameter>
            </Fill>
            <!--      <VendorOption name="conflictResolution">false</VendorOption> -->
            <Priority>1</Priority>
            <!--      <VendorOption name="conflictResolution">false</VendorOption> -->
            <VendorOption name="conflictResolution">true</VendorOption>
            <VendorOption name="charSpacing">3</VendorOption>
          </TextSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
