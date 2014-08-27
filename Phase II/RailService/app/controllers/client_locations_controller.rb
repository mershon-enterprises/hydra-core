class ClientLocationsController < ApplicationController
  before_action :set_client_location, only: [:show, :edit, :update, :destroy]

  # GET /client_locations
  # GET /client_locations.json
  def index
    @client_locations = ClientLocation.all
  end

  # GET /client_locations/1
  # GET /client_locations/1.json
  def show
  end

  # GET /client_locations/new
  def new
    @client_location = ClientLocation.new
  end

  # GET /client_locations/1/edit
  def edit
  end

  # POST /client_locations
  # POST /client_locations.json
  def create
    @client_location = ClientLocation.new(client_location_params)

    respond_to do |format|
      if @client_location.save
        format.html { redirect_to @client_location, notice: 'Client location was successfully created.' }
        format.json { render :show, status: :created, location: @client_location }
      else
        format.html { render :new }
        format.json { render json: @client_location.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /client_locations/1
  # PATCH/PUT /client_locations/1.json
  def update
    respond_to do |format|
      if @client_location.update(client_location_params)
        format.html { redirect_to @client_location, notice: 'Client location was successfully updated.' }
        format.json { render :show, status: :ok, location: @client_location }
      else
        format.html { render :edit }
        format.json { render json: @client_location.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /client_locations/1
  # DELETE /client_locations/1.json
  def destroy
    @client_location.destroy
    respond_to do |format|
      format.html { redirect_to client_locations_url, notice: 'Client location was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_client_location
      @client_location = ClientLocation.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def client_location_params
      params.require(:client_location).permit(:description, :client_id)
    end
end
